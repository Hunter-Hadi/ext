import Browser from 'webextension-polyfill'
import {
  createClientMessageListener,
  safeGetBrowserTab,
} from '@/background/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import {
  IAIResponseMessage,
  IAIResponseOriginalMessage,
  IChatMessage,
  IUserChatMessage,
  IUserChatMessageExtraType,
} from '@/features/chatgpt/types'
import { CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB } from '@/constants'
import { IAIProviderType } from '@/background/provider/chat'

import { default as lodashSet } from 'lodash-es/set'
import { default as lodashGet } from 'lodash-es/get'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { IAskChatGPTQuestionType } from '@/background/provider/chat/ChatAdapter'
import ConversationManager, {
  IChatConversation,
} from '@/background/src/chatConversations'
import { v4 as uuidV4 } from 'uuid'
import { getTextTokens } from '@/features/shortcuts/utils/tokenizer'
import isNumber from 'lodash-es/isNumber'
import { IThirdProviderSettings } from '@/background/utils/chromeExtensionStorage/type'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'

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
    const chatGPTProxyTab = await safeGetBrowserTab(chatGPTProxyTabId)
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
      originalMessage?: IAIResponseOriginalMessage
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

/**
 * 获取第三方AI Provider的设置
 * @param thirdProviderKey
 */
export const getThirdProviderSettings = async <T extends IAIProviderType>(
  thirdProviderKey: T,
) => {
  try {
    const settings = await getChromeExtensionLocalStorage()
    const thirdProviderSetting = settings.thirdProviderSettings
    if (thirdProviderSetting && thirdProviderSetting[thirdProviderKey]) {
      return thirdProviderSetting[thirdProviderKey] as IThirdProviderSettings[T]
    }
    return undefined
  } catch (e) {
    return undefined
  }
}

/**
 * 设置第三方AI Provider的设置
 * @param thirdProviderKey
 * @param newThirdProviderSettings
 */
export const setThirdProviderSettings = async <T extends IAIProviderType>(
  thirdProviderKey: T,
  newThirdProviderSettings: Partial<IThirdProviderSettings[T]>,
) => {
  try {
    await setChromeExtensionLocalStorage((settings) => {
      lodashSet(
        settings,
        `thirdProviderSettings.${thirdProviderKey}`,
        mergeWithObject([
          lodashGet(settings, `thirdProviderSettings.${thirdProviderKey}`),
          newThirdProviderSettings,
        ]),
      )
      return settings
    })
    console.log(await getChromeExtensionLocalStorage())
    return true
  } catch (e) {
    return false
  }
}

/**
 * 处理AI提问的参数
 */
export const processAskAIParameters = async (
  conversation: IChatConversation,
  question: IAskChatGPTQuestionType,
  options: IUserChatMessageExtraType,
) => {
  const { regenerate, retry } = options as IUserChatMessageExtraType
  // 如果是重试或者重新生成，需要从原始会话中获取问题
  const conversationId = question.conversationId
  if ((retry || regenerate) && conversationId) {
    const originalConversation = await ConversationManager.conversationDB.getConversationById(
      conversationId,
    )
    if (originalConversation) {
      const originalMessages = originalConversation.messages
      if (regenerate) {
        // 重新生成，需要删除原始会话中的问题
        const originalMessageIndex = originalMessages.findIndex(
          (message) => message.messageId === question.messageId,
        )
        const originalMessage = originalMessages[originalMessageIndex]
        const needDeleteCount =
          originalMessages.length - 1 - originalMessageIndex
        await ConversationManager.deleteMessages(
          conversationId,
          needDeleteCount,
        )
        // 重新生成问题
        if (originalMessage) {
          question.question = originalMessage.text
          question.messageId = originalMessage.messageId
          question.parentMessageId = originalMessage.parentMessageId || ''
        }
        conversation = (await ConversationManager.conversationDB.getConversationById(
          conversationId,
        )) as IChatConversation
      } else if (retry) {
        // 重试，到这一步sidebar里面有[问题，答案，新问题]，要删到[问题]
        const originalMessageIndex = originalMessages.findIndex(
          (message) => message.messageId === question.parentMessageId,
        )
        // 所以这里还要-1
        const originalMessage = originalMessages[originalMessageIndex]
        const needDeleteCount = Math.max(
          originalMessages.length - originalMessageIndex - 1,
          0,
        )
        await ConversationManager.deleteMessages(
          conversationId,
          needDeleteCount,
        )
        // 重新生成问题
        if (originalMessage) {
          question.question = originalMessage.text
          question.messageId = uuidV4()
          question.parentMessageId = originalMessage.parentMessageId || ''
        }
        conversation = (await ConversationManager.conversationDB.getConversationById(
          conversationId,
        )) as IChatConversation
      }
    }
  }
  // 聊天记录生成
  // 如果有includeHistory，并且没有主动传入historyMessages那么需要生成聊天记录
  if (
    options.includeHistory &&
    (!options.historyMessages || options.historyMessages?.length === 0)
  ) {
    // system prompt占用的tokens
    let systemPromptTokens = (
      await getTextTokens(conversation.meta.systemPrompt || '')
    ).length
    if (conversation?.meta?.docId) {
      // 因为有docId不会带上systemPrompt，所以不用计算tokens
      systemPromptTokens = 0
    }
    // question prompt占用的tokens
    const questionPromptTokens = (await getTextTokens(question.question)).length
    // api question 会用到1次message, maxHistoryCount - 1
    // NOTE: 因为有middle out, 设置默认的maxHistoryCount上限为100
    let maxHistoryCount = (conversation.meta.maxHistoryCount || 100) - 1
    // 如果有systemPrompt, maxHistoryCount - 1
    if (systemPromptTokens.length > 0) {
      maxHistoryCount -= 1
    }
    // 如果传入了maxHistoryMessageCnt，那么取最小值
    if (isNumber(options.maxHistoryMessageCnt)) {
      maxHistoryCount = Math.min(maxHistoryCount, options.maxHistoryMessageCnt)
    }
    /**
     * 最大历史记录token数 = maxTokens - systemPromptTokens - questionPromptTokens - 1000
     */
    const maxHistoryTokens =
      (conversation.meta.maxTokens || 4096) -
      systemPromptTokens -
      questionPromptTokens -
      1000 // 预留1000个token给ai生成的答案
    // 寻找本次提问的历史记录开始和结束节点
    let startIndex: number | null = null
    let endIndex: number | null = null
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      const message = conversation.messages[i]
      // 如果是ai回复，那么标记开始
      if (message.type === 'ai' && message.text && endIndex === null) {
        endIndex = i
      }
      // 如果是用户消息，从非includeHistory的消息开始
      if (message.type === 'user' && message.text && startIndex === null) {
        if (!(message as IUserChatMessage).extra.includeHistory) {
          startIndex = i
        }
      }
    }
    if (startIndex === null) {
      // 说明用户没用过contextMenu
      startIndex = 0
    }
    let historyTokensUsed = 0
    let historyCountUsed = 0
    const startMessages: Array<IUserChatMessage | IAIResponseMessage> = []
    const endMessages: Array<IUserChatMessage | IAIResponseMessage> = []
    // middle out 从尾部开始，直到满足条件
    if (endIndex !== null) {
      let addMessagePosition: 'start' | 'end' = 'end'
      // 如果小于最大历史记录长度，并且小于最大历史记录token数
      let needBreak = false
      while (
        historyTokensUsed < maxHistoryTokens &&
        historyCountUsed < maxHistoryCount
      ) {
        let message: IChatMessage | null = null
        if (addMessagePosition === 'end') {
          message = conversation.messages[endIndex] || null
          endIndex -= 1
        } else {
          message = conversation.messages[startIndex] || null
          startIndex += 1
        }
        if (!message) {
          break
        }
        if (message.type !== 'system' && message.type !== 'third') {
          const messageToken = (await getTextTokens(message.text)).length
          // 如果当前消息的token数大于最大历史记录token数，那么不添加
          if (historyTokensUsed + messageToken > maxHistoryTokens) {
            break
          } else {
            if (addMessagePosition === 'end') {
              endMessages.unshift(message as IUserChatMessage)
            } else {
              startMessages.push(message as IUserChatMessage)
            }
          }
          historyTokensUsed += messageToken
          historyCountUsed += 1
          addMessagePosition = addMessagePosition === 'end' ? 'start' : 'end'
        }
        if (needBreak) {
          break
        }
        // 如果开始下标和结束下标重合了，下一次才break
        // 例如start 1, end 2, end - 1 = 1, 但是start也得加，所以是下一次
        if (startIndex === endIndex) {
          needBreak = true
        }
      }
    }
    const historyMessages = startMessages.concat(endMessages)
    console.log(
      '新版Conversation History Messages',
      historyMessages,
      historyTokensUsed + systemPromptTokens,
    )
    options.historyMessages = historyMessages
  }
  return {
    question,
    options,
  }
}
