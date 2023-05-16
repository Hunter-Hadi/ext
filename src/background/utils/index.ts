import defaultContextMenuJson from '@/pages/options/data/defaultContextMenuJson'
import defaultGmailToolbarContextMenuJson from '@/pages/options/data/defaultGmailToolbarContextMenuJson'
import { IContextMenuItem } from '@/features/contextMenu'
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
import { IChatGPTProviderType } from '@/background/provider/chat/ChatAdapter'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { BingConversationStyle } from '@/background/src/chat/BingChat/bing/types'
import { PoeModel } from '@/background/src/chat/PoeChat/type'

dayjs.extend(utc)

export type IChatGPTModelType = {
  slug: string
  max_tokens: number
  title: string
  description: string
  tags?: string[]
  enabled_tools?: string[]
  qualitative_properties?: {
    reasoning: number[]
    speed: number[]
    conciseness: number[]
  }
}
export type IChatGPTPluginType = {
  id: string
  domain: string
  categories: unknown[]
  manifest?: {
    api: {
      type: string
      url: string
    }
    auth: {
      type: string
    }
    contact_email: string
    description_for_human: string
    description_for_model: string
    legal_info_url: string
    logo_url: string
    name_for_human: string
    name_for_model: string
    schema_version: string
  }
  namespace: string
  oauth_client_id: string
  status: 'approved'
  user_settings: {
    is_installed: boolean
    is_authenticated: boolean
  }
}

type IThirdProviderSettings = {
  [CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS]?: {
    [key in string]: any
  }
  [CHAT_GPT_PROVIDER.OPENAI]?: {
    [key in string]: any
  }
  [CHAT_GPT_PROVIDER.OPENAI_API]?: {
    [key in string]: any
  }
  [CHAT_GPT_PROVIDER.BING]?: {
    conversationStyle: BingConversationStyle
  }
  [CHAT_GPT_PROVIDER.BARD]?: {
    [key in string]: any
  }
  [CHAT_GPT_PROVIDER.CLAUDE]?: {
    model?: string
  }
}

export interface IChromeExtensionSettings {
  chatGPTProvider?: IChatGPTProviderType
  models?: IChatGPTModelType[]
  plugins?: IChatGPTPluginType[]
  currentModel?: string
  currentPlugins?: string[]
  conversationId?: string
  contextMenus?: IContextMenuItem[]
  gmailToolBarContextMenu?: IContextMenuItem[]
  userSettings?: {
    chatBoxWidth?: number
    colorSchema?: 'light' | 'dark'
    language?: string
    selectionButtonVisible?: boolean
    chatGPTStableModeDuration?: number
    pdf?: {
      enabled?: boolean
    }
  }
  thirdProviderSettings?: {
    [P in IChatGPTProviderType]?: IThirdProviderSettings[P]
  }
  lastModified?: number
}

export type IChromeExtensionSettingsContextMenuKey =
  | 'contextMenus'
  | 'gmailToolBarContextMenu'

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
      contextMenus: defaultContextMenuJson,
      gmailToolBarContextMenu: defaultGmailToolbarContextMenuJson,
      userSettings: {
        chatBoxWidth: CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
        chatGPTStableModeDuration: 30,
        colorSchema: undefined,
        language: DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
        selectionButtonVisible: true,
        pdf: {
          enabled: true,
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
    console.log('localData', localData)
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
    console.log('save', settingsOrUpdateFunction)
    console.log('get', await getChromeExtensionSettings())
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
      if (tab.id && tab.url) {
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
