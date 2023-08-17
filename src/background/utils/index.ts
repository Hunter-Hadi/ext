import defaultGmailToolbarContextMenuJson from '@/background/defaultPromptsData/defaultGmailToolbarContextMenuJson'
import Browser from 'webextension-polyfill'
import {
  AI_PROVIDER_MAP,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY,
  CHROME_EXTENSION_POST_MESSAGE_ID,
  CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
} from '@/constants'
import {
  IChromeExtensionListenEvent,
  IChromeExtensionSendEvent,
} from '@/background/eventType'
import { useEffect } from 'react'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {
  BING_MODELS,
  BingConversationStyle,
} from '@/background/src/chat/BingChat/bing/types'
import { POE_MODELS } from '@/background/src/chat/PoeChat/type'
import cloneDeep from 'lodash-es/cloneDeep'
import {
  IChromeExtensionButtonSetting,
  IChromeExtensionSettings,
  IChromeExtensionButtonSettingKey,
  IChromeExtensionSettingsUpdateFunction,
} from '@/background/types/Settings'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { IShortCutsSendEvent } from '@/features/shortcuts/background/eventType'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import { CLAUDE_MODELS } from '@/background/src/chat/ClaudeChat/claude/types'
import { removeAllChromeExtensionSettingsSnapshot } from '@/background/utils/chromeExtensionSettingsSnapshot'
import { clearContextMenuSearchTextStore } from '@/features/sidebar/store/contextMenuSearchTextStore'

export {
  resetChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
  getChromeExtensionOnBoardingData,
} from './onboardingStorage'

dayjs.extend(utc)

export const FILTER_SAVE_KEYS = [
  'currentModel',
  'currentPlugins',
  'plugins',
  'conversationId',
  'currentAIProvider',
  'commands',
  'models',
] as Array<keyof IChromeExtensionSettings>

export const getDefaultChromeExtensionSettings =
  (): IChromeExtensionSettings => {
    return {
      commands: [],
      models: [],
      currentModel: '',
      currentPlugins: [],
      plugins: [],
      conversationId: '',
      currentAIProvider: AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
      /** @deprecated **/
      contextMenus: [],
      /** @deprecated **/
      gmailToolBarContextMenu: [],
      userSettings: {
        preferredLanguage: 'en',
        chatBoxWidth: CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
        chatGPTStableModeDuration: 30,
        colorSchema: undefined,
        language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
        pdf: {
          enabled: true,
        },
        /** @deprecated **/
        gmailAssistant: true,
      },
      buttonSettings: {
        gmailButton: {
          visibility: {
            isWhitelistMode: true,
            whitelist: ['mail.google.com'],
            blacklist: [],
          },
          contextMenu: defaultGmailToolbarContextMenuJson,
        },
        textSelectPopupButton: {
          visibility: {
            isWhitelistMode: false,
            whitelist: [],
            blacklist: [],
          },
          contextMenu: [],
        },
      },
      thirdProviderSettings: {
        [AI_PROVIDER_MAP.BING]: {
          conversationStyle: BingConversationStyle.Balanced,
          model: BING_MODELS[0].value,
        },
        [AI_PROVIDER_MAP.CLAUDE]: {
          model: CLAUDE_MODELS[0].value,
        },
        [AI_PROVIDER_MAP.BARD]: {
          model: BARD_MODELS[0].value,
        },
        [AI_PROVIDER_MAP.OPENAI]: {
          model: 'text-davinci-002-render-sha',
        },
        [AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS]: {
          temperature: 1,
          model: USE_CHAT_GPT_PLUS_MODELS[0].value,
        },
        [AI_PROVIDER_MAP.OPENAI_API]: {
          model: OPENAI_API_MODELS[0].value,
          temperature: 1,
          apiKey: '',
          apiHost: 'https://api.openai.com',
        },
        [AI_PROVIDER_MAP.POE]: {
          model: POE_MODELS[0].value,
        },
      },
    } as IChromeExtensionSettings
  }

export const getChromeExtensionSettings =
  async (): Promise<IChromeExtensionSettings> => {
    const defaultConfig = getDefaultChromeExtensionSettings()
    const localData = await Browser.storage.local.get(
      CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY,
    )
    try {
      if (localData[CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY]) {
        const localSettings = JSON.parse(
          localData[CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY],
        )
        const cloneDefaultConfig = cloneDeep(defaultConfig)
        const cloneLocalSettings = cloneDeep(localSettings)
        // 为了提高merge的性能，先把contextMenu字段拿出来 -- 开始
        const buttonMap = new Map()
        // 默认的buttonSettings
        const defaultButtonSettings = cloneDeep(
          cloneDefaultConfig.buttonSettings,
        )
        if (defaultButtonSettings) {
          Object.keys(defaultButtonSettings).forEach((buttonKey) => {
            if (
              defaultButtonSettings[
                buttonKey as IChromeExtensionButtonSettingKey
              ].contextMenu?.length > 0
            ) {
              buttonMap.set(
                buttonKey,
                cloneDeep(
                  defaultButtonSettings[
                    buttonKey as IChromeExtensionButtonSettingKey
                  ].contextMenu,
                ),
              )
              defaultButtonSettings[
                buttonKey as IChromeExtensionButtonSettingKey
              ].contextMenu = []
            }
          })
        }
        // 本地的buttonSettings
        const localButtonSettings = cloneDeep(cloneLocalSettings.buttonSettings)
        if (localButtonSettings) {
          if (localSettings.contextMenus?.length > 0) {
            localButtonSettings.textSelectPopupButton.contextMenu =
              localSettings.contextMenus
            localSettings.contextMenus = []
          }
          if (localSettings.gmailToolBarContextMenu?.length > 0) {
            localButtonSettings.gmailButton.contextMenu =
              localSettings.gmailToolBarContextMenu
            localSettings.gmailToolBarContextMenu = []
          }
          Object.keys(localButtonSettings).forEach((buttonKey) => {
            if (localButtonSettings[buttonKey].contextMenu?.length > 0) {
              buttonMap.set(
                buttonKey,
                cloneDeep(localButtonSettings[buttonKey].contextMenu),
              )
              localButtonSettings[buttonKey].contextMenu = []
            }
          })
        }
        const currentButtonContentMenuSettings: {
          [key in IChromeExtensionButtonSettingKey]: Partial<IChromeExtensionButtonSetting>
        } = {
          gmailButton: {},
          textSelectPopupButton: {},
        }
        Object.keys(currentButtonContentMenuSettings).forEach((buttonKey) => {
          if (buttonMap.has(buttonKey)) {
            currentButtonContentMenuSettings[
              buttonKey as IChromeExtensionButtonSettingKey
            ].contextMenu = buttonMap.get(buttonKey)
          }
        })
        // 为了提高merge的性能，先把contextMenu字段拿出来 -- 结束
        // 因为每次版本更新都可能会有新字段，用本地的覆盖默认的就行
        const mergedSettings = mergeWithObject([
          cloneDefaultConfig,
          cloneLocalSettings,
          {
            buttonSettings: defaultButtonSettings,
          },
          {
            buttonSettings: localButtonSettings,
          },
          {
            buttonSettings: currentButtonContentMenuSettings,
          },
        ]) as IChromeExtensionSettings
        console.log('mergedSettings', mergedSettings)
        // 废弃字段处理
        // 1. 去掉selectionButtonVisible字段控制 - v2.0.2 - 20230710
        if (
          Object.prototype.hasOwnProperty.call(
            mergedSettings.userSettings as any,
            'selectionButtonVisible',
          )
        ) {
          // 说明用户打开了textSelectPopupButton
          if ((mergedSettings.userSettings as any).selectionButtonVisible) {
            // 需要把textSelectPopupButton的visibility的黑名单模式打开
            mergedSettings.buttonSettings!.textSelectPopupButton.visibility.isWhitelistMode =
              false
          } else {
            // 需要把textSelectPopupButton的visibility的白名单模式打开
            mergedSettings.buttonSettings!.textSelectPopupButton.visibility.isWhitelistMode =
              true
            mergedSettings.buttonSettings!.textSelectPopupButton.visibility.whitelist =
              []
          }
          delete (mergedSettings.userSettings as any).selectionButtonVisible
        }
        return mergedSettings
      } else {
        return defaultConfig
      }
    } catch (e) {
      // 说明没有这个字段，应该返回默认的配置
      return defaultConfig
    }
  }

export const getChromeExtensionButtonContextMenu = async (
  buttonKey: IChromeExtensionButtonSettingKey,
) => {
  const settings = await getChromeExtensionSettings()
  const cacheMenus = settings.buttonSettings?.[buttonKey].contextMenu
  return cacheMenus || []
}

export const setChromeExtensionSettings = async (
  settingsOrUpdateFunction:
    | IChromeExtensionSettings
    | IChromeExtensionSettingsUpdateFunction,
): Promise<boolean> => {
  try {
    const oldSettings = await getChromeExtensionSettings()
    if (settingsOrUpdateFunction instanceof Function) {
      const newSettings = settingsOrUpdateFunction(oldSettings)
      await Browser.storage.local.set({
        [CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY]:
          JSON.stringify(newSettings),
      })
    } else {
      await Browser.storage.local.set({
        [CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY]: JSON.stringify({
          ...oldSettings,
          ...settingsOrUpdateFunction,
        }),
      })
    }
    return true
  } catch (e) {
    return false
  }
}

export const backgroundSendAllClientMessage = async (
  event: IChromeExtensionSendEvent,
  data: any,
) => {
  const tabs = await Browser.tabs.query({})
  await Promise.all(
    tabs.map(async (tab) => {
      if (
        tab.id &&
        tab.url &&
        tab.status === 'complete' &&
        !tab.url.startsWith('https://chat.openai.com')
      ) {
        try {
          await Browser.tabs.sendMessage(tab.id, {
            id: CHROME_EXTENSION_POST_MESSAGE_ID,
            event,
            data,
          })
        } catch (e) {
          // console.error(
          //   'backgroundSendAllClientMessage: \t',
          //   e,
          //   tab.url,
          //   tab.id,
          // )
        }
      }
    }),
  )
}
export const backgroundSendClientMessage = async (
  clientTabId: number,
  event: IChromeExtensionSendEvent,
  data: any,
) => {
  const currentTab = await Browser.tabs.get(clientTabId)
  if (currentTab && currentTab.id) {
    try {
      const result = await Browser.tabs.sendMessage(currentTab.id, {
        id: CHROME_EXTENSION_POST_MESSAGE_ID,
        event,
        data,
      })
      return result
    } catch (e) {
      console.error(
        'backgroundSendClientMessage: \t',
        e,
        currentTab.url,
        currentTab.id,
      )
      return undefined
    }
  }
  return undefined
}

/**
 * background监听client、daemon_process、shortcut的发送消息
 * @param listener
 */
export const createBackgroundMessageListener = (
  listener: (
    runtime: 'client' | 'daemon_process' | 'shortcut',
    event: IChromeExtensionListenEvent,
    data: any,
    sender: Browser.Runtime.MessageSender,
  ) => Promise<{ success: boolean; data?: any; message?: string } | undefined>,
) => {
  Browser.runtime.onMessage.addListener((message, sender) => {
    const {
      data: { _RUNTIME_, ...rest },
      event,
      id,
    } = message
    if (id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
      return
    }
    return new Promise((resolve) => {
      listener(_RUNTIME_, event, rest, sender).then((result) => {
        if (result && Object.prototype.hasOwnProperty.call(result, 'success')) {
          resolve(result)
        }
      })
    })
  })
}

/**
 * client、daemon_process监听background的发送消息
 * @param listener
 */
export const createClientMessageListener = (
  listener: (
    event: IChromeExtensionSendEvent,
    data: any,
    sender: Browser.Runtime.MessageSender,
  ) => Promise<{ success: boolean; data?: any; message?: string } | undefined>,
) => {
  const modifyListener = (
    message: any,
    sender: Browser.Runtime.MessageSender,
  ) => {
    const { data, event, id } = message
    if (id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
      return
    }
    return new Promise((resolve) => {
      listener(event, data, sender).then((result) => {
        if (result && Object.prototype.hasOwnProperty.call(result, 'success')) {
          resolve(result)
        }
      })
    })
  }
  Browser.runtime.onMessage.addListener(modifyListener)
  return () => {
    Browser.runtime.onMessage.removeListener(modifyListener)
  }
}
/**
 *
 * @param client、daemon_process监听background的发送消息
 */
export const useCreateClientMessageListener = (
  listener: (
    event: IChromeExtensionSendEvent,
    data: any,
    sender: Browser.Runtime.MessageSender,
  ) => Promise<{ success: boolean; data?: any; message?: string } | undefined>,
) => {
  useEffect(() => {
    const modifyListener = (
      message: any,
      sender: Browser.Runtime.MessageSender,
    ) => {
      const { data, event, id } = message
      if (id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
        return
      }
      return new Promise((resolve) => {
        listener(event, data, sender).then((result) => {
          if (
            result &&
            Object.prototype.hasOwnProperty.call(result, 'success')
          ) {
            resolve(result)
          }
        })
      })
    }
    Browser.runtime.onMessage.addListener(modifyListener)
    return () => {
      Browser.runtime.onMessage.removeListener(modifyListener)
    }
  }, [])
}

/**
 * 获取插件快捷键
 */
export const getChromeExtensionCommands = async (): Promise<
  Array<{
    name?: string
    shortcut?: string
    description?: string
  }>
> => {
  const port = new ContentScriptConnectionV2()
  const result = await port.postMessage({
    event: 'Client_getChromeExtensionCommands',
    data: {},
  })
  if (result.success) {
    return result.data
  } else {
    return []
  }
}
/**
 * 创建settings页面
 * @param query
 * @param autoFocus
 */
export const createChromeExtensionOptionsPage = async (
  query = '',
  autoFocus = true,
) => {
  const chromeExtensionId = Browser.runtime.id
  const findOptionPages = await Browser.tabs.query({
    url: `chrome-extension://${chromeExtensionId}/pages/settings/index.html`,
  })
  // close old pages
  await Promise.all(
    findOptionPages.map(async (page) => {
      if (page.id) {
        await Browser.tabs.remove(page.id)
      }
    }),
  )
  await Browser.tabs.create({
    url: `chrome-extension://${chromeExtensionId}/pages/settings/index.html${query}`,
    active: autoFocus,
  })
}

/**
 * 登出
 */
export const chromeExtensionLogout = async () => {
  // 清空用户token
  await Browser.storage.local.remove(
    CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  )
  // 清空用户设置
  await Browser.storage.local.remove(
    CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY,
  )
  // 清空本地own prompts快照
  await removeAllChromeExtensionSettingsSnapshot()
  // 清空本地i18n language
  await clearContextMenuSearchTextStore()
}

/**
 * 获取网页内容
 * @param url
 * @param maxWaitTime
 */
export const backgroundGetUrlContent = async (
  url: string,
  maxWaitTime = 15 * 1000,
): Promise<{
  success: boolean
  data: {
    success: boolean
    title?: string
    body?: string
    url?: string
  }
  message?: string
}> => {
  const backgroundConversation = new ContentScriptConnectionV2({
    runtime: 'shortcut',
  })
  const fallback = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          message: 'timeout',
          data: undefined,
        })
      }, maxWaitTime)
    })
  }
  const response = backgroundConversation.postMessage({
    event: 'ShortCuts_getContentOfURL' as IShortCutsSendEvent,
    data: {
      URL: url,
    },
  }) as any
  return Promise.race([response, fallback()]).then((result) => {
    return result
  })
}
/**
 * 重启插件
 */
export const backgroundRestartChromeExtension = async () => {
  try {
    const tabIds = await Browser.tabs.query({
      active: true,
      currentWindow: true,
    })
    await Browser.runtime.reload()
    tabIds.forEach((tab) => {
      if (tab.id) {
        Browser.tabs.reload(tab.id)
      }
    })
  } catch (e) {
    console.error('reStartChromeExtension: \t', e)
  }
}

export const getPreviousVersion = (version: string): string => {
  const [major, minor, patch] = version.split('.').map(Number)
  if (patch > 0) {
    return `${major}.${minor}.${patch - 1}`
  } else if (minor > 0) {
    return `${major}.${minor - 1}.99`
  } else if (major > 0) {
    return `${major - 1}.99.99`
  } else {
    throw new Error('Cannot get previous version for version 0.0.0')
  }
}
