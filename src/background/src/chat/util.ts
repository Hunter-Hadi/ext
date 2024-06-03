import { default as lodashGet } from 'lodash-es/get'
import isNumber from 'lodash-es/isNumber'
import { default as lodashSet } from 'lodash-es/set'
import sum from 'lodash-es/sum'
import Browser from 'webextension-polyfill'

import { IAIProviderType } from '@/background/provider/chat'
import {
  IMaxAIChatMessageContent,
  IMaxAIChatMessageContentType,
  IMaxAIRequestHistoryMessage,
} from '@/background/src/chat/UseChatGPTChat/types'
import {
  createClientMessageListener,
  safeGetBrowserTab,
} from '@/background/utils'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { IThirdProviderSettings } from '@/background/utils/chromeExtensionStorage/type'
import {
  CHATGPT_WEBAPP_HOST,
  CHROME_EXTENSION_LOCAL_WINDOWS_ID_OF_CHATGPT_TAB,
} from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import {
  isAIMessage,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
import { requestIdleCallbackPolyfill } from '@/features/common/utils/polyfills'
import {
  backgroundConversationDB,
  backgroundConversationDBGetMessageIds,
} from '@/features/indexed_db/conversations/background'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import {
  IAIResponseMessage,
  IAIResponseOriginalMessage,
  IAIResponseSourceCitation,
  IChatMessage,
  IChatUploadFile,
  IUserChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import {
  calculateMaxResponseTokens,
  getTextTokens,
} from '@/features/shortcuts/utils/tokenizer'
import {
  formatAIMessageContent,
  formatUserMessageContent,
  safeGetAttachmentExtractedContent,
} from '@/features/sidebar/utils/chatMessagesHelper'
import { filesizeFormatter } from '@/utils/dataHelper/numberHelper'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

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
    (tab) => tab.url?.indexOf(CHATGPT_WEBAPP_HOST) !== -1 && tab.id,
  )
  // 如果有pinned的chatGPT tab并且tab id存在
  if (currentPinnedTab && currentPinnedTab.windowId === lastBrowserWindowId) {
    await Browser.tabs.update(currentPinnedTab.id, {
      active: true,
      url: `https://${CHATGPT_WEBAPP_HOST}/?model=gpt-4`,
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
      url: `https://${CHATGPT_WEBAPP_HOST}/?model=gpt-4`,
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

export const clientAskAIQuestion = async (
  question: IUserChatMessage,
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
      sourceCitations?: IAIResponseSourceCitation[]
    }) => Promise<void>
    onError?: (error: string) => Promise<void>
  },
) => {
  const tasks: any = []
  return new Promise((resolve) => {
    const taskId = question.messageId
    let isRunningTask = false
    let prevTaskIndex = -1
    const runTask = () => {
      requestIdleCallbackPolyfill(
        (deadline) => {
          if (deadline?.didTimeout) {
            console.log(
              `测试requestIdleCallbackPolyfill timeout`,
              deadline.didTimeout,
              deadline.timeRemaining(),
            )
          }
          if (tasks.length === 0) {
            // 说明还没有任务
            runTask()
            return
          }
          const currentTaskIndex = tasks.length - 1
          if (currentTaskIndex <= prevTaskIndex) {
            // 说明没有新的任务
            runTask()
            return
          }
          prevTaskIndex = currentTaskIndex
          const lastTaskData = tasks[currentTaskIndex]
          console.log(
            `测试requestIdleCallbackPolyfill [${tasks.length - 1}]`,
            lastTaskData?.data?.text,
            lastTaskData,
          )
          const isDone = lastTaskData.done
          // 因为在结束之后可能立刻要执行一些promise方法，必须等onMessage执行完后再去做操作
          if (isDone) {
            if (lastTaskData.error) {
              onError?.(lastTaskData.error).finally(() => {
                resolve(true)
                destroyListener()
              })
            } else if (lastTaskData?.data?.text) {
              // 如果有lastTaskData?.data?.text，那么执行onMessage
              onMessage?.(lastTaskData.data).finally(() => {
                resolve(true)
                destroyListener()
              })
            } else {
              // 像ChatGPt在onDone的时候是没有text的，所以直接resolve
              resolve(true)
              destroyListener()
            }
          } else {
            if (lastTaskData.error) {
              onError?.(lastTaskData.error)
            } else if (lastTaskData?.data?.text) {
              onMessage?.(lastTaskData.data)
            }
            runTask()
          }
        },
        {
          timeout: 200,
        },
      )
    }
    const destroyListener = createClientMessageListener(async (event, data) => {
      if (
        event === 'Client_askChatGPTQuestionResponse' &&
        data.taskId === taskId
      ) {
        tasks.push(data)
        if (!isRunningTask) {
          isRunningTask = true
          runTask()
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
        conversationId: question.conversationId,
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
 * 获取AI Provider的设置
 * @param AIProviderKey
 */
export const getAIProviderSettings = async <T extends IAIProviderType>(
  AIProviderKey: T,
) => {
  try {
    const settings = await getChromeExtensionLocalStorage()
    const providerSetting = settings.thirdProviderSettings
    if (providerSetting && providerSetting[AIProviderKey]) {
      return providerSetting[AIProviderKey] as IThirdProviderSettings[T]
    }
    return undefined
  } catch (e) {
    return undefined
  }
}

/**
 * 设置AI Provider的设置
 * @param AIProviderKey
 * @param newAIProviderSettings
 */
export const setAIProviderSettings = async <T extends IAIProviderType>(
  AIProviderKey: T,
  newAIProviderSettings: Partial<IThirdProviderSettings[T]>,
) => {
  try {
    await setChromeExtensionLocalStorage((settings) => {
      lodashSet(
        settings,
        `thirdProviderSettings.${AIProviderKey}`,
        mergeWithObject([
          lodashGet(settings, `thirdProviderSettings.${AIProviderKey}`),
          newAIProviderSettings,
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

export const getMessageAttachmentExtractedContent = (
  attachment: IChatUploadFile,
  message: IChatMessage,
) => {
  const attachmentExtractedContent =
    message.extendContent?.attachmentExtractedContents?.[attachment.id] ||
    attachment.extractedContent ||
    ''
  return safeGetAttachmentExtractedContent(attachmentExtractedContent)
}

/**
 * 获取消息的token数
 * @param message
 */
export const getMessageTokens = async (message: IChatMessage) => {
  if (isUserMessage(message)) {
    const attachments = message.meta?.attachments || []
    const attachmentTokens = sum(
      attachments.map((attachment) => {
        const attachmentExtractedContent = getMessageAttachmentExtractedContent(
          attachment,
          message,
        )
        if (attachmentExtractedContent) {
          return getTextTokens(attachmentExtractedContent).length
        }
        return 0
      }),
    )
    return getTextTokens(message.text).length + attachmentTokens
  } else if (isAIMessage(message)) {
    if (message.originalMessage?.content?.text) {
      return getTextTokens(message.originalMessage.content.text).length
    } else {
      return getTextTokens(message.text).length
    }
  } else {
    return getTextTokens(message.text).length
  }
}

export const chatMessageToMaxAIRequestMessage = (
  message: IChatMessage,
  isHistory?: boolean,
): IMaxAIRequestHistoryMessage => {
  const baseRequestMessage: IMaxAIRequestHistoryMessage = {
    role:
      message.type === 'ai'
        ? 'ai'
        : message.type === 'user'
        ? 'human'
        : 'system',
    content: [],
  }
  if (isAIMessage(message)) {
    baseRequestMessage.content.push({
      type: 'text',
      text: message.originalMessage?.content?.text || message.text || '',
    })
  } else if (isUserMessage(message)) {
    const userMessageContent: IMaxAIChatMessageContent[] = []
    const userMessageQuestion = {
      type: 'text' as IMaxAIChatMessageContentType,
      text: message.text,
    }
    let extractedContent = ''
    // 需要拼接附件
    if (message.meta?.attachments) {
      message.meta.attachments.forEach((attachment) => {
        if (attachment.uploadStatus === 'success') {
          const attachmentExtractedContent =
            getMessageAttachmentExtractedContent(attachment, message)
          if (attachmentExtractedContent) {
            if (!extractedContent) {
              extractedContent = `\n\n---\n\nBelow, you will find the information and content of the file(s) mentioned above. Each file is delimited by <file></file>:\n\n`
            }
            extractedContent += `<file>\nFile Name: ${
              attachment.fileName
            }\n\nFile Size: ${filesizeFormatter(
              attachment.fileSize,
            )}\n\nFile Content:\n${attachmentExtractedContent}\n</file>\n\n`
          } else if (
            attachment.uploadedUrl &&
            attachment.fileType.includes('image')
          ) {
            userMessageContent.push({
              type: 'image_url',
              image_url: {
                url: attachment.uploadedUrl,
              },
            })
          }
        }
      })
    }
    let userContextText = ''
    // 拼接上下文，并且是系统预设的prompt
    if (
      isHistory &&
      message.meta?.contexts?.length &&
      message.meta.MaxAIPromptActionConfig
    ) {
      userMessageQuestion.text = `# ${
        message.meta.messageVisibleText ||
        message.meta.contextMenu?.text ||
        message.text
      }`

      userContextText = '\n\n## Contexts'

      message.meta.contexts.forEach((context) => {
        userContextText += `\n\n### ${context.key}\n${context.value}`
      })
    }
    if (extractedContent) {
      userMessageQuestion.text += `${extractedContent}`
    }
    if (userContextText) {
      userMessageQuestion.text += `${userContextText}`
    }
    userMessageContent.unshift(userMessageQuestion)
    baseRequestMessage.content = userMessageContent
  } else {
    baseRequestMessage.content.push({
      type: 'text',
      text: message.text || '',
    })
  }
  return baseRequestMessage
}

/**
 * 处理AI提问的参数
 */
export const processAskAIParameters = async (
  conversation: IConversation,
  question: IUserChatMessage,
) => {
  const { includeHistory, historyMessages } = question?.meta || {}
  // 聊天记录生成
  // 如果有includeHistory，那么需要生成聊天记录
  if (includeHistory && !historyMessages) {
    // 当前会话使用的Model的maxTokens
    let conversationUsingModelMaxTokens = conversation.meta.maxTokens || 4096
    // system prompt占用的tokens
    let systemPromptTokens = (
      await getTextTokens(conversation.meta.systemPrompt || '')
    ).length
    if (conversation?.meta?.docId) {
      // NOTE: 因为docId用的是chat_with_document，model写死是gpt-3.5-16k-turbo, 所以上限是12k
      conversationUsingModelMaxTokens = 12000
      // 因为有docId不会带上systemPrompt，所以不用计算tokens
      systemPromptTokens = 0
    }
    // question prompt占用的tokens
    const questionPromptTokens = (await getTextTokens(question.text)).length
    // api question 会用到1次message, maxHistoryCount - 1
    // NOTE: 因为有middle out, 设置默认的maxHistoryCount上限为100
    let maxHistoryCount = (conversation.meta.maxHistoryCount || 100) - 1
    // 如果有systemPrompt, maxHistoryCount - 1
    if (systemPromptTokens > 0) {
      maxHistoryCount -= 1
    }
    /**
     * 最大历史记录token数 = maxAIModelTokens - questionPromptTokens - systemPromptTokens - 2000(responseTokens)
     */
    const maxHistoryTokens =
      conversationUsingModelMaxTokens -
      systemPromptTokens -
      questionPromptTokens -
      calculateMaxResponseTokens(conversationUsingModelMaxTokens)
    const messageIds = await backgroundConversationDBGetMessageIds(
      conversation.id,
    )
    // 寻找本次提问的历史记录开始和结束节点
    let startIndex: number | null = null
    let endIndex: number | null = null
    for (let i = messageIds.length - 1; i >= 0; i--) {
      const message = await backgroundConversationDB.messages.get(messageIds[i])
      // 如果是ai回复，那么标记开始
      if (
        message &&
        isAIMessage(message) &&
        formatAIMessageContent(message, false)
      ) {
        if (endIndex === null) {
          endIndex = i
        }
        // 如果已经有结束节点了，找到includeHistory为false的作为开始
        if (!startIndex) {
          if (
            (message as IAIResponseMessage)?.originalMessage?.metadata
              ?.includeHistory === false
          ) {
            startIndex = i
          }
        }
      }
      // 如果是用户消息，从非includeHistory的消息开始
      if (
        message &&
        isUserMessage(message) &&
        formatUserMessageContent(message) &&
        startIndex === null
      ) {
        if ((message as IUserChatMessage)?.meta?.includeHistory === false) {
          startIndex = i
        }
      }
      // 如果都找到了，那么break
      if (isNumber(startIndex) && isNumber(endIndex)) {
        break
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
        let messageId: string | null = null
        if (addMessagePosition === 'end') {
          messageId = messageIds[endIndex] || null
          endIndex -= 1
        } else {
          messageId = messageIds[startIndex] || null
          startIndex += 1
        }
        if (!messageId) {
          break
        }
        const message = await backgroundConversationDB.messages.get(messageId)
        if (message && message.type !== 'system' && message.type !== 'third') {
          const messageToken = await getMessageTokens(message)
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
        } else if (startIndex > endIndex) {
          // 很特殊的场景在search with ai中
          // 例如start 2, end 2, end - 1 = 1, start>end, 所以直接break
          break
        }
      }
    }
    const historyMessages = startMessages.concat(endMessages)
    console.log(
      '新版Conversation History Messages',
      historyMessages,
      historyTokensUsed + systemPromptTokens,
    )
    if (question.meta) {
      question.meta.historyMessages = historyMessages
    }
  }
}

/**
 * 预处理保存的消息
 * @param message
 */
export const processPreSaveChatMessage = async (message: IChatMessage) => {
  if (isAIMessage(message)) {
    // 触发安全限制的消息
    const content = formatAIMessageContent(message, false)
    if (
      content.includes(`\u2060\u200c\u200d\u200b\u2060\u200c\u200d\u200b`) ||
      content.includes(
        `\\u2060\\u200c\\u200d\\u200b\\u2060\\u200c\\u200d\\u200b`,
      )
    ) {
      if (!message.originalMessage) {
        message.originalMessage = {
          content: {
            text: content,
            contentType: 'text',
          },
        }
      }
      if (!message.originalMessage.metadata) {
        message.originalMessage.metadata = {}
      }
      message.originalMessage.metadata.isTriggeredContentReview = true
      message.originalMessage.metadata.includeHistory = false
      message.originalMessage.metadata.isComplete = true
    }
  }
  return message
}

/**
 * 判断是否是第三方的AI provider
 * @param AIProvider
 */
export const checkIsThirdPartyAIProvider = (AIProvider: IAIProviderType) => {
  return ['OPENAI', 'OPENAI_API', 'BING', 'BARD', 'CLAUDE', 'POE'].includes(
    AIProvider,
  )
}
