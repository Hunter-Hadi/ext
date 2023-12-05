import Browser from 'webextension-polyfill'
import {
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  CHROME_EXTENSION_DB_STORAGE_SAVE_KEY,
  CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import {
  IChromeExtensionListenEvent,
  IChromeExtensionSendEvent,
} from '@/background/eventType'
import { useEffect } from 'react'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { IShortCutsSendEvent } from '@/features/shortcuts/messageChannel/eventType'
import { removeAllChromeExtensionSettingsSnapshot } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorageSnapshot'
import { clearContextMenuSearchTextStore } from '@/features/sidebar/store/contextMenuSearchTextStore'
import { setChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'

export {
  resetChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
  getChromeExtensionOnBoardingData,
} from './chromeExtensionStorage/chromeExtensionOnboardingStorage'

dayjs.extend(utc)

export const backgroundSendAllClientMessage = async (
  event: IChromeExtensionSendEvent,
  data: any,
) => {
  const tabs = await Browser.tabs.query({})
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))
  await Promise.race([
    ...tabs.map(async (tab) => {
      if (tab.id) {
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
    delay(1000),
  ])
}
export const backgroundSendClientMessage = async (
  clientTabId: number,
  event: IChromeExtensionSendEvent,
  data: any,
) => {
  const currentTab = await safeGetBrowserTab(clientTabId)
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
  const currentListener = (message: any, sender: any) => {
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
  }
  Browser.runtime.onMessage.addListener(currentListener)
  return () => {
    Browser.runtime.onMessage.removeListener(currentListener)
  }
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
  // url: `chrome-extension://${chromeExtensionId}/pages/settings/index.html`,
  const findOptionPages = (await Browser.tabs.query({})).filter((tab) => {
    return tab.url?.startsWith(
      `chrome-extension://${chromeExtensionId}/pages/settings/index.html`,
    )
  })
  // close old pages
  await Promise.all(
    findOptionPages.map(async (page) => {
      if (page.id) {
        await Browser.tabs.remove(page.id)
      }
    }),
  )
  const tab = await Browser.tabs.create({
    url: `chrome-extension://${chromeExtensionId}/pages/settings/index.html${query}`,
    active: autoFocus,
  })
  return tab.id
}

/**
 * 创建immsersive chat页面
 * @param query
 * @param autoFocus
 */
export const createChromeExtensionImmersiveChatPage = async (
  query = '',
  autoFocus = true,
) => {
  const chromeExtensionId = Browser.runtime.id
  // url: `chrome-extension://${chromeExtensionId}/pages/settings/index.html`,
  const findOptionPages = (await Browser.tabs.query({})).filter((tab) => {
    return tab.url?.startsWith(
      `chrome-extension://${chromeExtensionId}/pages/chat/index.html`,
    )
  })
  // close old pages
  await Promise.all(
    findOptionPages.map(async (page) => {
      if (page.id) {
        await Browser.tabs.remove(page.id)
      }
    }),
  )
  const tab = await Browser.tabs.create({
    url: `chrome-extension://${chromeExtensionId}/pages/chat/index.html${query}`,
    active: autoFocus,
  })
  return tab.id
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
  await Browser.storage.local.remove(CHROME_EXTENSION_DB_STORAGE_SAVE_KEY)
  // 清空本地own prompts快照
  await removeAllChromeExtensionSettingsSnapshot()
  // 清空本地i18n language
  await clearContextMenuSearchTextStore()
  // 清空chat
  await setChromeExtensionLocalStorage({
    sidebarSettings: {
      chat: {
        conversationId: '',
      },
      search: {
        conversationId: '',
      },
      summary: {
        conversationId: '',
      },
      common: {
        currentAIProvider: 'OPENAI',
      },
    },
  })
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

/**
 * 安全的获取浏览器的tab
 * @description - 因为Browser.tabs.get在获取不到tab的时候会抛出异常，影响background正常运行
 * @param tabId
 */
export const safeGetBrowserTab = async (tabId?: number) => {
  if (tabId) {
    try {
      return await Browser.tabs.get(tabId)
    } catch (e) {
      return null
    }
  } else {
    return null
  }
}

/**
 * 判断插件是否有这个网站的权限
 * @param host
 */
export const requestHostPermission = async (host: string) => {
  const permissions: Browser.Permissions.Permissions = { origins: [host] }
  if (await Browser.permissions.contains(permissions)) {
    return true
  }
  return Browser.permissions.request(permissions)
}
export { IChromeExtensionDBStorageUpdateFunction } from '@/background/utils/chromeExtensionStorage/type'
export { IChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/type'
export { IChromeExtensionButtonSettingKey } from '@/background/utils/chromeExtensionStorage/type'
export { IChatGPTPluginType } from '@/background/utils/chromeExtensionStorage/type'
export { IChatGPTModelType } from '@/background/utils/chromeExtensionStorage/type'
