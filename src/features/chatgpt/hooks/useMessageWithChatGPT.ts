import { useRecoilState } from 'recoil'
import { useCallback, useEffect, useRef } from 'react'
import { v4 as uuidV4 } from 'uuid'
import {
  ChatGPTMessageState,
  ChatGPTConversationState,
} from '@/features/sidebar/store'
import {
  ContentScriptConnectionV2,
  getAIProviderSampleFiles,
} from '@/features/chatgpt/utils'
import Log from '@/utils/Log'
import { askChatGPTQuestion } from '@/background/src/chat/util'
import { setChromeExtensionSettings } from '@/background/utils'
import { increaseChatGPTRequestCount } from '@/features/chatgpt/utils/chatRequestRecorder'
import { useCleanChatGPT } from '@/features/chatgpt/hooks/useCleanChatGPT'
import {
  IAIResponseMessage,
  IChatMessage,
  ISystemChatMessage,
  IThirdChatMessage,
  IUserChatMessage,
  IUserChatMessageExtraType,
} from '@/features/chatgpt/types'
import { CHAT_GPT_PROMPT_PREFIX } from '@/constants'
import { getMediator } from '@/store/InputMediator'
import { getCurrentDomainHost, showChatBox } from '@/utils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import Browser from 'webextension-polyfill'
import {
  isPermissionCardSceneType,
  PermissionWrapperCardSceneType,
  PermissionWrapperCardType,
} from '@/features/auth/components/PermissionWrapper/types'
import { usePermissionCardMap } from '@/features/auth/hooks/usePermissionCard'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
dayjs.extend(relativeTime)
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const log = new Log('UseMessageWithChatGPT')

const useMessageWithChatGPT = (defaultInputValue?: string) => {
  const permissionCardMap = usePermissionCardMap()
  const { currentUserPlan } = useUserInfo()
  const defaultValueRef = useRef<string>(defaultInputValue || '')
  const [messages, setMessages] = useRecoilState(ChatGPTMessageState)
  const [conversation, setConversation] = useRecoilState(
    ChatGPTConversationState,
  )
  const { cleanChatGPT } = useCleanChatGPT()
  const resetConversation = async () => {
    // 清空输入框
    updateChatInputValue('')
    await cleanChatGPT()
  }
  /**
   * 创建会话目的是初始化并获取缓存中使用的conversationId, 不会创建conversationId
   */
  const createConversation = async () => {
    const result = await port.postMessage({
      event: 'Client_createChatGPTConversation',
      data: {},
    })
    log.info('createConversation', result)
    if (result.success) {
      setConversation((prevState) => {
        return {
          ...prevState,
          conversationId: result.data.conversationId,
        }
      })
      return result.data.conversationId
    } else {
      return ''
    }
  }
  const sendQuestion = async (
    questionInfo: {
      question: string
      messageId?: string
      parentMessageId?: string
    },
    options?: IUserChatMessageExtraType,
  ): Promise<{ success: boolean; answer: string; error: string }> => {
    const host = getCurrentDomainHost()
    const contextMenu = options?.meta?.contextMenu
    // 发消息前,或者报错信息用到的升级卡片
    let abortAskAIShowUpgradeCard: PermissionWrapperCardType | null = null
    const checkUpgradeCard = () => {
      // 发消息之前判断有没有要付费升级的卡片
      if (abortAskAIShowUpgradeCard) {
        const { title, description, imageUrl, videoUrl } =
          abortAskAIShowUpgradeCard
        const needUpgradeMessage: ISystemChatMessage = {
          type: 'system',
          text: '',
          messageId: uuidV4(),
          parentMessageId: '',
          extra: {
            status: 'error',
            systemMessageType: 'needUpgrade',
            permissionSceneType: abortAskAIShowUpgradeCard.sceneType,
          },
        }
        let markdownText = `**${title}**\n${description}\n\n`
        if (imageUrl) {
          markdownText = `![${title}](${imageUrl})\n${markdownText}`
        } else if (videoUrl) {
          markdownText = `![${title}](${videoUrl})\n${markdownText}`
        }
        needUpgradeMessage.text = markdownText
        // log
        authEmitPricingHooksLog('show', abortAskAIShowUpgradeCard.sceneType)
        // 展示sidebar
        showChatBox()
        setMessages((prevState) => {
          return [...prevState, needUpgradeMessage]
        })
        return {
          success: false,
          answer: '',
          error: '',
        }
      }
      return null
    }
    // 判断是否在特殊页面开始:
    // 1.PDF\Google Doc，如果是
    //     1.1 判断如果是否是免费用户(并且不是新用户)，如果是，弹出升级卡片
    if (
      currentUserPlan.name === 'free' &&
      contextMenu?.id &&
      !currentUserPlan.isNewUser
    ) {
      const url = new URL(location.href)
      const PDFViewerHref = `${Browser.runtime.id}/pages/pdf/web/viewer.html`
      if (url.href.includes(PDFViewerHref)) {
        abortAskAIShowUpgradeCard = permissionCardMap['PDF_AI_VIEWER']
      }
    }
    // 判断是否在特殊页面结束
    // 判断是否触达dailyUsageLimited开始:
    const { data: isDailyUsageLimit } = await port.postMessage({
      event: 'Client_logCallApiRequest',
      data: {
        name: contextMenu?.text || 'chat',
        id: contextMenu?.id || 'chat',
        host,
      },
    })
    if (isDailyUsageLimit && false) {
      abortAskAIShowUpgradeCard = permissionCardMap['TOTAL_CHAT_DAILY_LIMIT']
    }
    // 判断是否触达dailyUsageLimited结束
    const { question, messageId, parentMessageId } = questionInfo
    const {
      regenerate = false,
      includeHistory = false,
      maxHistoryMessageCnt = 0,
    } = options || {}
    if (!question || conversation.loading) {
      return {
        success: false,
        answer: '',
        error: '',
      }
    }
    setConversation((prevState) => {
      return {
        ...prevState,
        loading: true,
      }
    })
    const postConversationId: string = await createConversation()
    log.info(
      `[ChatGPT Module] send question step 0, init ConversationId=[${postConversationId}]`,
    )
    let currentMaxHistoryMessageCnt = maxHistoryMessageCnt
    // 如果没有传入指定的历史会话长度，并且includeHistory===true,计算历史会话条数
    if (!maxHistoryMessageCnt && includeHistory) {
      let historyCnt = 0
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i] as IUserChatMessage
        if (msg.type === 'user' && msg.extra?.includeHistory === false) {
          historyCnt++
          break
        }
        historyCnt++
      }
      currentMaxHistoryMessageCnt = historyCnt
      console.log(
        '[ChatGPT Module] currentMaxHistoryMessageCnt',
        currentMaxHistoryMessageCnt,
      )
    }
    const currentMessageId = messageId || uuidV4()
    const currentParentMessageId = parentMessageId || ''
    log.info(
      `[ChatGPT Module] send question step 1\n maxHistoryMessageCnt=[${currentMaxHistoryMessageCnt}]\n messageId=[${currentMessageId}]\n parentMessageId=[${currentParentMessageId}]`,
    )
    log.info('[ChatGPT Module] send question step 2, push user message')
    const attachments = await getAIProviderSampleFiles()
    setMessages((prevState) => {
      return [
        ...prevState,
        {
          type: 'user',
          messageId: currentMessageId,
          parentMessageId: currentParentMessageId,
          text: question,
          extra: {
            includeHistory,
            regenerate,
            maxHistoryMessageCnt: currentMaxHistoryMessageCnt,
            meta: {
              contextMenu: options?.meta?.contextMenu,
              attachments,
            },
          },
        } as IUserChatMessage,
      ]
    })
    setConversation((prevState) => {
      return {
        ...prevState,
        lastMessageId: currentMessageId,
        loading: true,
      }
    })
    log.info('[ChatGPT Module] send question step 3 ask question')
    const pushMessages: IChatMessage[] = []
    let isManualStop = false
    let hasError = false
    let errorMessage = ''
    try {
      // 提前结束ask ai的流程
      const abortData = checkUpgradeCard()
      if (abortData) {
        return abortData
      }
      // 发消息之前记录总数
      await increaseChatGPTRequestCount('total')
      // 发消息之前记录prompt/chat
      await increaseChatGPTRequestCount('prompt', {
        name: contextMenu?.text || 'chat',
        id: contextMenu?.id || 'chat',
        host,
      })
      // ai 正在输出的消息
      let aiRespondingMessage: any = null
      let saveConversationId = ''
      await askChatGPTQuestion(
        {
          conversationId: postConversationId,
          question: includeHistory
            ? question
            : CHAT_GPT_PROMPT_PREFIX + question,
          messageId: currentMessageId,
          parentMessageId: currentParentMessageId,
        },
        {
          includeHistory,
          regenerate,
          maxHistoryMessageCnt: currentMaxHistoryMessageCnt,
        },
        {
          onMessage: (msg) => {
            log.info('[ChatGPT Module] send question onmessage', msg)
            const writingMessage: IAIResponseMessage = {
              messageId: (msg.messageId as string) || uuidV4(),
              parentMessageId: (msg.parentMessageId as string) || uuidV4(),
              text: (msg.text as string) || '',
              type: 'ai' as const,
            }
            aiRespondingMessage = writingMessage
            if (msg.conversationId) {
              saveConversationId = msg.conversationId
            }
            setConversation((prevState) => {
              return {
                ...prevState,
                conversationId:
                  msg.conversationId || prevState.conversationId || '',
                loading: true,
                writingMessage,
              }
            })
          },
          onError: (error: any) => {
            hasError = true
            log.info('[ChatGPT Module] send question onerror', error)
            if (aiRespondingMessage?.messageId) {
              pushMessages.push(aiRespondingMessage)
            }
            const is403Error =
              typeof error === 'string' && error?.trim() === '403'
            if (error === 'Conversation not found' || is403Error) {
              setConversation((prevState) => {
                return {
                  ...prevState,
                  conversationId: '',
                }
              })
            }
            errorMessage =
              error?.message || error || 'Error detected. Please try again.'
            if (errorMessage === 'manual aborted request.') {
              isManualStop = true
              // 手动取消的请求不计入错误
            } else {
              increaseChatGPTRequestCount('error')
              if (is403Error) {
                errorMessage = `Log into ChatGPT web app and pass Cloudflare check. We recommend enabling our new [ChatGPT Stable Mode](key=options&query=#chatgpt-stable-mode) to avoid frequent interruptions and network errors.`
              }
              if (errorMessage.startsWith('Too many requests in 1 hour')) {
                errorMessage = `Too many requests in 1 hour. Try again later, or use our new AI provider for free by selecting "MaxAI.me" from the AI Provider options at the top of the sidebar.
                ![switch-provider](https://www.maxai.me/assets/chrome-extension/switch-provider.png)`
              }
              if (isPermissionCardSceneType(errorMessage)) {
                abortAskAIShowUpgradeCard =
                  permissionCardMap[
                    errorMessage as PermissionWrapperCardSceneType
                  ]
                const abortData = checkUpgradeCard()
                if (abortData) {
                  return abortData
                }
              }
              pushMessages.push({
                type: 'system',
                messageId: uuidV4(),
                parentMessageId: currentMessageId,
                text: errorMessage,
                extra: {
                  status: 'error',
                },
              } as ISystemChatMessage)
            }
            log.info('onerror', error, pushMessages)
            return
          },
        },
      )
      if (
        !hasError &&
        aiRespondingMessage &&
        aiRespondingMessage?.messageId &&
        aiRespondingMessage?.text
      ) {
        await increaseChatGPTRequestCount('success')
        if (saveConversationId) {
          await setChromeExtensionSettings({
            conversationId: saveConversationId,
          })
        }
        pushMessages.push(aiRespondingMessage as IAIResponseMessage)
        return Promise.resolve({
          success: true,
          answer: aiRespondingMessage?.text || '',
          error: '',
        })
      }
      return Promise.resolve({
        success: isManualStop,
        answer: aiRespondingMessage?.text || '',
        error: errorMessage,
      })
    } catch (e) {
      log.error(`send question error`, e)
      return Promise.resolve({
        success: false,
        answer: '',
        error: (e as any).message || e,
      })
    } finally {
      // 清空输入框
      updateChatInputValue('')
      // 更新消息
      setMessages((prevState) => {
        return [...prevState, ...pushMessages]
      })
      // 清空writingMessage
      setConversation((prevState) => {
        return {
          ...prevState,
          writingMessage: null,
          loading: false,
        }
      })
    }
  }
  const retryMessage = async (retryMessageId: string) => {
    const originMessage = messages.find(
      (message) => message.messageId === retryMessageId,
    )
    if (originMessage) {
      setConversation((prevState) => {
        return {
          ...prevState,
          loading: true,
        }
      })
      const delay = (t: number) =>
        new Promise((resolve) => setTimeout(resolve, t))
      await delay(3000)
      await sendQuestion(
        {
          question: originMessage.text,
          messageId: uuidV4(),
          parentMessageId: originMessage.parentMessageId,
        },
        {
          regenerate: false,
          includeHistory: true,
        },
      )
    }
  }
  const reGenerate = useCallback(() => {
    let lastUserMessage: IUserChatMessage | null = null
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]
      if (message.type === 'user') {
        lastUserMessage = message as IUserChatMessage
        break
      }
    }
    console.log('handleShortCut regenerate run !', lastUserMessage)
    if (lastUserMessage) {
      // remove after last user message
      const index = messages.indexOf(lastUserMessage)
      setMessages(messages.slice(0, index))
      return sendQuestion(
        {
          question: lastUserMessage.text,
          messageId: lastUserMessage.messageId,
          parentMessageId: lastUserMessage.parentMessageId,
        },
        {
          regenerate: true,
          includeHistory: Object.prototype.hasOwnProperty.call(
            lastUserMessage.extra,
            'includeHistory',
          )
            ? lastUserMessage.extra.includeHistory
            : true,
          meta: lastUserMessage.extra.meta,
        },
      )
    }
    return null
  }, [messages, sendQuestion])
  const stopGenerateMessage = async () => {
    const parentMessageId = conversation.writingMessage?.parentMessageId
    if (parentMessageId || conversation.lastMessageId) {
      const result = await port.postMessage({
        event: 'Client_abortAskChatGPTQuestion',
        data: {
          messageId: conversation.lastMessageId,
        },
      })
      log.info('stopGenerateMessage', result)
    }
  }
  const pushMessage = (newMessage: ISystemChatMessage | IThirdChatMessage) => {
    setMessages((prevState) => {
      return [...prevState, newMessage]
    })
  }
  const updateChatInputValue = (value: string) => {
    getMediator('chatBoxInputMediator').updateInputValue(value)
  }
  useEffect(() => {
    if (defaultInputValue) {
      defaultValueRef.current = defaultInputValue
    }
  }, [defaultInputValue])
  return {
    sendQuestion,
    messages,
    resetConversation,
    conversation,
    retryMessage,
    reGenerate,
    stopGenerateMessage,
    pushMessage,
  }
}
export { useMessageWithChatGPT }
