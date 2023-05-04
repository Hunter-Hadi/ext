import defaultContextMenuJson from '@/pages/options/data/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/pages/options/data/defaultGmailToolbarContextMenuJson'
import { IContextMenuItem } from '@/features/contextMenu'
import Browser from 'webextension-polyfill'
import {
  CHAT_GPT_PROVIDER,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY,
  CHROME_EXTENSION_POST_MESSAGE_ID,
  DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
} from '@/types'
import {
  IChromeExtensionListenEvent,
  IChromeExtensionSendEvent,
} from '@/background/eventType'
import { useEffect } from 'react'
import { IChatGPTProviderType } from '@/background/provider/chat/ChatAdapter'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'

export type IChatGPTModelType = {
  slug: string
  max_tokens: number
  title: string
  description: string
  tags?: string[]
  qualitative_properties?: {
    reasoning: number[]
    speed: number[]
    conciseness: number[]
  }
}
export type IChromeExtensionSettings = {
  chatGPTProvider?: IChatGPTProviderType
  models?: IChatGPTModelType[]
  currentModel?: string
  conversationId?: string
  contextMenus?: IContextMenuItem[]
  gmailToolBarContextMenu?: IContextMenuItem[]
  userSettings?: {
    colorSchema?: 'light' | 'dark'
    language?: string
    selectionButtonVisible?: boolean
    chatGPTStableModeDuration?: number
  }
  lastModified?: number
}

export type IChromeExtensionSettingsContextMenuKey =
  | 'contextMenus'
  | 'gmailToolBarContextMenu'

export const getChromeExtensionSettings =
  async (): Promise<IChromeExtensionSettings> => {
    const defaultConfig = {
      commands: [],
      models: [],
      currentModel: '',
      conversationId: '',
      chatGPTProvider: CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS,
      contextMenus: defaultContextMenuJson,
      gmailToolBarContextMenu: defaultGmailToolbarContextMenuJson,
      userSettings: {
        chatGPTStableModeDuration: 30,
        colorSchema: undefined,
        language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
        selectionButtonVisible: true,
      },
    } as IChromeExtensionSettings
    const localData = await Browser.storage.local.get(
      CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY,
    )
    try {
      if (localData[CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY]) {
        const settings = {
          // 因为每次版本更新都可能会有新字段，用本地的覆盖默认的就行
          ...defaultConfig,
          ...JSON.parse(
            localData[CHROME_EXTENSION_LOCAL_STORAGE_CLIENT_SAVE_KEY],
          ),
        }
        return settings
      } else {
        return defaultConfig
      }
    } catch (e) {
      // 说明没有这个字段，应该返回默认的配置
      return defaultConfig
    }
  }

export const getChromeExtensionContextMenu = async (
  menuType: IChromeExtensionSettingsContextMenuKey,
) => {
  const settings = await getChromeExtensionSettings()
  const defaultMenus = {
    contextMenus: defaultContextMenuJson,
    gmailToolBarContextMenu: defaultGmailToolbarContextMenuJson,
  }
  const cacheMenus = settings[menuType]
  if (cacheMenus && cacheMenus.length > 0) {
    return cacheMenus
  } else {
    return defaultMenus[menuType]
  }
}

type IChromeExtensionSettingsUpdateFunction = (
  settings: IChromeExtensionSettings,
) => IChromeExtensionSettings

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
        tab.url.startsWith('http') &&
        !tab.url.startsWith('https://chat.openai.com')
      ) {
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
 * background监听client、daemon_process的发送消息
 * @param listener
 */
export const createBackgroundMessageListener = (
  listener: (
    runtime: 'client' | 'daemon_process',
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
  const findOptionPage = await Browser.tabs.query({
    url: `chrome-extension://${chromeExtensionId}/options.html`,
  })
  if (findOptionPage && findOptionPage.length > 0) {
    await Browser.tabs.update(findOptionPage[0].id, {
      url: `chrome-extension://${chromeExtensionId}/options.html${query}`,
      active: autoFocus,
    })
    return
  } else {
    await Browser.tabs.create({
      url: `chrome-extension://${chromeExtensionId}/options.html${query}`,
      active: autoFocus,
    })
  }
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
