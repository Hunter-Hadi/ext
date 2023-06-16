import { useRecoilState, useRecoilValue } from 'recoil'
import { useCallback, useEffect, useRef } from 'react'
import { v4 as uuidV4 } from 'uuid'
import {
  ChatGPTMessageState,
  ChatGPTConversationState,
} from '@/features/gmail/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { AppSettingsState } from '@/store'
import Log from '@/utils/Log'
import { askChatGPTQuestion } from '@/background/src/chat/util'
import { setChromeExtensionSettings } from '@/background/utils'
import { increaseChatGPTRequestCount } from '@/features/chatgpt/utils/chatRequestRecorder'
import { useCleanChatGPT } from '@/features/chatgpt/hooks/useCleanChatGPT'
import {
  IAIResponseMessage,
  IChatMessage,
  ISystemMessage,
  IUserSendMessage,
  IUserSendMessageExtraType,
} from '@/features/chatgpt/types'
import { CHAT_GPT_PROMPT_PREFIX } from '@/constants'
import { getMediator } from '@/store/mediator'
import { getCurrentDomainHost } from '@/utils'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const log = new Log('UseMessageWithChatGPT')

const useMessageWithChatGPT = (defaultInputValue?: string) => {
  const appSettings = useRecoilValue(AppSettingsState)
  const defaultValueRef = useRef<string>(defaultInputValue || '')
  const [messages, setMessages] = useRecoilState(ChatGPTMessageState)
  const [conversation, setConversation] = useRecoilState(
    ChatGPTConversationState,
  )
  const { cleanChatGPT } = useCleanChatGPT()
  const resetConversation = async () => {
    port
      .postMessage({
        event: 'Client_removeChatGPTConversation',
        data: {},
      })
      .then((result) => {
        log.info(
          '[ChatGPT]: resetConversation',
          result.data,
          defaultValueRef.current,
          appSettings.currentModel,
        )
      })
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
    options?: IUserSendMessageExtraType,
  ): Promise<{ success: boolean; answer: string; error: string }> => {
    const { question, messageId, parentMessageId } = questionInfo
    const {
      regenerate = false,
      includeHistory = false,
      maxHistoryMessageCnt = 0,
    } = options || {}
    if (!question || conversation.loading) {
      return Promise.resolve({
        success: false,
        answer: '',
        error: '',
      })
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
        const msg = messages[i] as IUserSendMessage
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
          },
        } as IUserSendMessage,
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
      // 发消息之前记录
      await increaseChatGPTRequestCount('total')
      // ai 正在输出的消息
      let aiRespondingMessage: any = null
      let saveConversationId = ''
      if (includeHistory) {
        await increaseChatGPTRequestCount('prompt', {
          id: 'chat',
          name: 'chat',
          host: getCurrentDomainHost(),
        })
      }
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
            if (error === 'manual aborted request.') {
              isManualStop = true
              // 手动取消的请求不计入错误
            } else {
              increaseChatGPTRequestCount('error')
              if (is403Error) {
                errorMessage = `Log into ChatGPT and pass Cloudflare check. We recommend enabling our new [ChatGPT Stable Mode](key=options&query=#chatgpt-stable-mode) to avoid frequent interruptions and network errors.`
              }
              if (errorMessage.startsWith('Too many requests in 1 hour')) {
                errorMessage = `Too many requests in 1 hour. Try again later, or use our new AI provider for free by selecting "UseChatGPT.AI" from the AI Provider options at the top of the sidebar.
                ![switch-provider](https://www.usechatgpt.ai/assets/chrome-extension/switch-provider.png)`
              }
              pushMessages.push({
                type: 'system',
                messageId: uuidV4(),
                parentMessageId: currentMessageId,
                text: errorMessage,
                extra: {
                  status: 'error',
                },
              } as ISystemMessage)
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
    let lastUserMessage: IUserSendMessage | null = null
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]
      if (message.type === 'user') {
        lastUserMessage = message as IUserSendMessage
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
  const pushMessage = (
    type: 'system' | 'third',
    text: string,
    status?: 'success' | 'error',
  ) => {
    setMessages((prevState) => {
      return [
        ...prevState,
        {
          type,
          status,
          messageId: uuidV4(),
          parentMessageId: '',
          text,
        },
      ]
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
