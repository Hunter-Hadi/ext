import defaultContextMenuJson from '@/pages/options/data/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/pages/options/data/defaultGmailToolbarContextMenuJson'
import Browser from 'webextension-polyfill'
import {
  CHAT_GPT_PROVIDER,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY,
  CHROME_EXTENSION_POST_MESSAGE_ID,
  CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
} from '@/types'
import {
  IChromeExtensionListenEvent,
  IChromeExtensionSendEvent,
} from '@/background/eventType'
import { useEffect } from 'react'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { BingConversationStyle } from '@/background/src/chat/BingChat/bing/types'
import { PoeModel } from '@/background/src/chat/PoeChat/type'
import merge from 'lodash-es/merge'
import cloneDeep from 'lodash-es/cloneDeep'
import {
  IChromeExtensionButtonSetting,
  IChromeExtensionSettings,
  IChromeExtensionButtonSettingKey,
  IChromeExtensionSettingsUpdateFunction,
} from '@/background/types/Settings'

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
  'chatGPTProvider',
  'commands',
  'models',
] as Array<keyof IChromeExtensionSettings>

export const getChromeExtensionSettings =
  async (): Promise<IChromeExtensionSettings> => {
    const defaultConfig = {
      commands: [],
      models: [],
      currentModel: '',
      currentPlugins: [],
      plugins: [],
      conversationId: '',
      chatGPTProvider: CHAT_GPT_PROVIDER.OPENAI,
      /** @deprecated **/
      contextMenus: [],
      /** @deprecated **/
      gmailToolBarContextMenu: [],
      userSettings: {
        chatBoxWidth: CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
        chatGPTStableModeDuration: 30,
        colorSchema: undefined,
        language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
        selectionButtonVisible: true,
        pdf: {
          enabled: true,
        },
        /** @deprecated **/
        gmailAssistant: true,
      },
      buttonSettings: {
        gmailButton: {
          isWhitelistMode: false,
          whitelist: [],
          blacklist: [],
          contextMenu: defaultGmailToolbarContextMenuJson,
        },
        textSelectPopupButton: {
          isWhitelistMode: false,
          whitelist: [],
          blacklist: [],
          contextMenu: defaultContextMenuJson,
        },
      },
      thirdProviderSettings: {
        [CHAT_GPT_PROVIDER.BING]: {
          conversationStyle: BingConversationStyle.Balanced,
        },
        [CHAT_GPT_PROVIDER.CLAUDE]: {
          model: PoeModel.ClaudeInstant,
        },
      },
    } as IChromeExtensionSettings
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
        const mergedSettings = merge(
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
        )
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
  const defaultMenus = {
    gmailButton: defaultContextMenuJson,
    textSelectPopupButton: defaultGmailToolbarContextMenuJson,
  }
  const cacheMenus = settings.buttonSettings?.[buttonKey].contextMenu
  if (cacheMenus && cacheMenus.length > 0) {
    return cacheMenus
  } else {
    return defaultMenus[buttonKey]
  }
}

export const setChromeExtensionSettings = async (
  settingsOrUpdateFunction:
    | IChromeExtensionSettings
    | IChromeExtensionSettingsUpdateFunction,
): Promise<boolean> => {
  try {
    const oldSettings = await getChromeExtensionSettings()
    if (settingsOrUpdateFunction instanceof Function) {
      await Browser.storage.local.set({
        [CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY]: JSON.stringify(
          settingsOrUpdateFunction(oldSettings),
        ),
      })
    } else {
      await Browser.storage.local.set({
        [CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY]: JSON.stringify(
          merge(oldSettings, settingsOrUpdateFunction),
        ),
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
      if (tab.id && tab.url && !tab.url.startsWith('https://chat.openai.com')) {
        try {
          await Browser.tabs.sendMessage(tab.id, {
            id: CHROME_EXTENSION_POST_MESSAGE_ID,
            event,
            data,
          })
        } catch (e) {
          console.error(
            'backgroundSendAllClientMessage: \t',
            e,
            tab.url,
            tab.id,
          )
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
export const createChromeExtensionOptionsPage = async (
  query = '',
  autoFocus = true,
) => {
  const chromeExtensionId = Browser.runtime.id
  const findOptionPages = await Browser.tabs.query({
    url: `chrome-extension://${chromeExtensionId}/pages/options/index.html`,
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
    url: `chrome-extension://${chromeExtensionId}/pages/options/index.html${query}`,
    active: autoFocus,
  })
}
export const chromeExtensionLogout = async () => {
  // 清空用户token
  await Browser.storage.local.remove(
    CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  )
  // 清空用户设置
  await Browser.storage.local.remove(
    CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY,
  )
}
