import Browser from 'webextension-polyfill'
import {
  createClientMessageListener,
  getChromeExtensionSettings,
} from '@/background/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { IUserChatMessageExtraType } from '@/features/chatgpt/types'
import { CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB } from '@/constants'

// let lastBrowserWindowId: number | undefined = undefined
/**
 * 创建守护进程的tab
 */
export const createDaemonProcessTab = async () => {
  let lastBrowserWindowId = await getWindowIdOfChatGPTTab()
  const pinedTabs = await Browser.tabs.query({
    pinned: true,
  })
  let currentPinnedTab: Browser.Tabs.Tab | undefined = pinedTabs.find(
    (tab) => tab.url?.indexOf('chat.openai.com') !== -1 && tab.id,
  )
  // 如果有pinned的chatGPT tab并且tab id存在
  if (currentPinnedTab && currentPinnedTab.windowId === lastBrowserWindowId) {
    await Browser.tabs.update(currentPinnedTab.id, {
      active: true,
      url: 'https://chat.openai.com/?model=gpt-4',
    })
    if (currentPinnedTab.windowId) {
      await Browser.windows.update(currentPinnedTab.windowId, {
        state: 'normal',
        focused: true,
      })
    }
  } else {
    let window: Browser.Windows.Window | undefined = undefined
    if (lastBrowserWindowId) {
      try {
        window = await Browser.windows.get(lastBrowserWindowId)
      } catch (e) {
        lastBrowserWindowId = undefined
      }
    }
    if (!window) {
      if (currentPinnedTab && currentPinnedTab.id) {
        // 如果有pinned的chatGPT tab并且没有window，说明不是我们创建的pinned tab
        // 需要关闭
        await Browser.tabs.remove(currentPinnedTab.id)
      }
      // create a special windows for chatGPT
      const window = await Browser.windows.create({
        focused: true,
        state: 'normal',
        width: 1280,
      })
      lastBrowserWindowId = window.id
    }
    // 创建一个新的tab
    currentPinnedTab = await Browser.tabs.create({
      url: 'https://chat.openai.com/?model=gpt-4',
      pinned: true,
      windowId: window?.id,
    })
    // 移除空的tab
    if (lastBrowserWindowId) {
      const tabs = await Browser.tabs.query({
        windowId: lastBrowserWindowId,
        pinned: false,
      })
      console.log('tabs移除空的tab', tabs)
      for (const tab of tabs) {
        if (
          tab.id &&
          (tab.pendingUrl === `chrome://newtab/` ||
            tab.pendingUrl === `about:blank` ||
            tab.url === '')
        ) {
          await Browser.tabs.remove(tab.id)
        }
      }
    }
  }

  await setWindowIdOfChatGPTTab(lastBrowserWindowId)
  return currentPinnedTab
}

/**
 * 确认守护进程是否存在
 * @param chatGPTProxyInstance
 */
export const checkChatGPTProxyInstance = async (
  chatGPTProxyInstance: Browser.Tabs.Tab,
) => {
  const chatGPTProxyTabId = chatGPTProxyInstance?.id
  if (!chatGPTProxyTabId) {
    return false
  }
  try {
    const chatGPTProxyTab = await Browser.tabs.get(chatGPTProxyTabId)
    if (!chatGPTProxyTab) {
      return false
    }
  } catch (e) {
    return false
  }
  return true
}

export const askChatGPTQuestion = async (
  question: {
    messageId: string
    parentMessageId: string
    conversationId: string
    question: string
  },
  options: IUserChatMessageExtraType,
  {
    onMessage,
    onError,
  }: {
    onMessage?: (answer: {
      messageId: string
      parentMessageId: string
      conversationId: string
      text: string
    }) => void
    onError?: (error: string) => void
  },
) => {
  return new Promise((resolve) => {
    const taskId = question.messageId
    const destroyListener = createClientMessageListener(async (event, data) => {
      if (
        event === 'Client_askChatGPTQuestionResponse' &&
        data.taskId === taskId
      ) {
        if (data.error) {
          onError?.(data.error)
        } else if (data?.data?.text) {
          onMessage?.(data.data)
        }
        if (data.done) {
          resolve(true)
          destroyListener()
          return {
            success: true,
            message: 'ok',
            data: {},
          }
        }
        return {
          success: true,
          message: 'ok',
          data: {},
        }
      }
      return undefined
    })
    const port = new ContentScriptConnectionV2({
      runtime: 'client',
    })
    port.postMessage({
      event: 'Client_askChatGPTQuestion',
      data: {
        taskId,
        question,
        options,
      },
    })
  })
}
export const getCacheConversationId = async () => {
  const settings = await getChromeExtensionSettings()
  return settings.conversationId || ''
}

export const getWindowIdOfChatGPTTab = async () => {
  const result = await Browser.storage.local.get(
    CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB,
  )
  if (result[CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB]) {
    return result[CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB]
  } else {
    return undefined
  }
}

export const setWindowIdOfChatGPTTab = async (windowId: number) => {
  await Browser.storage.local.set({
    [CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB]: windowId,
  })
}
