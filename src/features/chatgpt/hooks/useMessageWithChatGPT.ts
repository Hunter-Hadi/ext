import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'
import { useEffect, useRef } from 'react'
import { v4 as uuidV4 } from 'uuid'
import {
  ChatGPTMessageState,
  ChatGPTConversationState,
  ChatGPTInputState,
  InboxEditState,
} from '@/features/gmail/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { IGmailChatMessage } from '@/features/gmail/components/GmailChatBox'
import { CHAT_GPT_MESSAGES_RECOIL_KEY } from '@/types'
import { AppSettingsState } from '@/store'
import Browser from 'webextension-polyfill'
import Log from '@/utils/Log'
import { askChatGPTQuestion } from '@/background/src/chat/util'
import { setChromeExtensionSettings } from '@/background/utils'
import {
  saveChatGPTErrorRecord,
  setChatGPTNormalTime,
} from '@/features/chatgpt/utils/403Recorder'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const log = new Log('UseMessageWithChatGPT')

const useMessageWithChatGPT = (defaultInputValue?: string) => {
  const appSettings = useRecoilValue(AppSettingsState)
  const updateInboxEditState = useSetRecoilState(InboxEditState)
  const defaultValueRef = useRef<string>(defaultInputValue || '')
  const [messages, setMessages] = useRecoilState(ChatGPTMessageState)
  const [inputValue, setInputValue] = useRecoilState(ChatGPTInputState)
  const [conversation, setConversation] = useRecoilState(
    ChatGPTConversationState,
  )
  const resetConversation = async () => {
    const result = await port.postMessage({
      event: 'Client_removeChatGPTConversation',
      data: {},
    })
    log.info(
      '[ChatGPT]: resetConversation',
      result.data,
      defaultValueRef.current,
      appSettings.currentModel,
    )
    setInputValue(defaultValueRef.current)
    setMessages([])
    setConversation({
      model: appSettings.currentModel || '',
      conversationId: '',
      writingMessage: null,
      loading: false,
    })
    // 清空本地储存的message
    await Browser.storage.local.set({
      [CHAT_GPT_MESSAGES_RECOIL_KEY]: JSON.stringify([]),
    })
    // 清空本地储存的conversationId
    await setChromeExtensionSettings({
      conversationId: '',
    })
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
  // const createSystemMessage = (
  //   parentMessageId: string,
  //   error: string,
  //   status: 'success' | 'error',
  // ) => {
  //   setMessages((prevState) => {
  //     return [
  //       ...prevState,
  //       {
  //         type: 'system',
  //         messageId: uuidV4(),
  //         parentMessageId,
  //         text: error,
  //         status,
  //       },
  //     ]
  //   })
  // }
  const sendQuestion = async (
    questionInfo: {
      question: string
      messageId?: string
      parentMessageId?: string
    },
    options?: {
      regenerate?: boolean
      includeHistory?: boolean
    },
  ): Promise<{ success: boolean; answer: string }> => {
    const { question, messageId, parentMessageId } = questionInfo
    const { regenerate = false, includeHistory = false } = options || {}
    if (!question || conversation.loading) {
      return Promise.resolve({
        success: false,
        answer: '',
      })
    }
    log.info('[ChatGPT Module] send question step 0')
    const postConversationId: string = await createConversation()
    log.info('[ChatGPT Module] send question step 1')
    const currentMessageId = messageId || uuidV4()
    const currentParentMessageId = parentMessageId || ''
    setMessages((prevState) => {
      return [
        ...prevState,
        {
          type: 'user',
          messageId: currentMessageId,
          parentMessageId: currentParentMessageId,
          text: question,
        } as IGmailChatMessage,
      ]
    })
    setConversation((prevState) => {
      return {
        ...prevState,
        lastMessageId: currentMessageId,
        loading: true,
      }
    })
    log.info('[ChatGPT Module] send question step 2')
    log.info(
      '[ChatGPT Module] send question step 3',
      currentMessageId,
      parentMessageId,
      postConversationId,
    )
    const pushMessages: IGmailChatMessage[] = []
    let hasError = false
    try {
      let currentMessage: any = null
      let saveConversationId = ''
      await askChatGPTQuestion(
        {
          conversationId: postConversationId,
          question,
          messageId: currentMessageId,
          parentMessageId: currentParentMessageId,
        },
        {
          includeHistory,
          regenerate,
        },
        {
          onMessage: (msg) => {
            log.info('[ChatGPT Module] send question onmessage', msg)
            const writingMessage = {
              messageId: (msg.messageId as string) || uuidV4(),
              parentMessageId: (msg.parentMessageId as string) || uuidV4(),
              text: (msg.text as string) || '',
              type: 'ai' as const,
            }
            currentMessage = writingMessage
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
            if (currentMessage?.messageId) {
              pushMessages.push(currentMessage as IGmailChatMessage)
            }
            error = '403'
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
            if (error !== 'manual aborted request.') {
              let text =
                error?.message || error || 'Error detected. Please try again.'
              if (is403Error) {
                saveChatGPTErrorRecord()
                text = `Log in to ChatGPT and pass Cloudflare check. We recommend enabling our new [ChatGPT Stable Mode](key=options&query=#chatgpt-stable-mode) to avoid frequent interruptions and network errors.`
              }
              pushMessages.push({
                type: 'system',
                status: 'error',
                messageId: uuidV4(),
                parentMessageId: currentMessageId,
                text,
              })
            }
            log.info('onerror', error, pushMessages)
            return
          },
        },
      )
      if (!hasError && currentMessage?.messageId && currentMessage?.text) {
        setChatGPTNormalTime(Date.now())
        if (saveConversationId) {
          await setChromeExtensionSettings({
            conversationId: saveConversationId,
          })
        }
        pushMessages.push(currentMessage as IGmailChatMessage)
        return Promise.resolve({
          success: true,
          answer: currentMessage?.text || '',
        })
      }
      return Promise.resolve({
        success: false,
        answer: '',
      })
    } catch (e) {
      log.error(`send question error`, e)
      return Promise.resolve({
        success: false,
        answer: '',
      })
    } finally {
      setMessages((prevState) => {
        return [...prevState, ...pushMessages]
      })
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
  const reGenerateMessage = () => {
    let lastUserMessage: IGmailChatMessage | null = null
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i]
      if (message.type === 'user') {
        lastUserMessage = message
        break
      }
    }
    if (lastUserMessage) {
      // remove after last user message
      const index = messages.indexOf(lastUserMessage)
      setMessages((prevState) => {
        return prevState.slice(0, index)
      })
      return sendQuestion(
        {
          question: lastUserMessage.text,
          messageId: lastUserMessage.messageId,
          parentMessageId: lastUserMessage.parentMessageId,
        },
        {
          regenerate: true,
          includeHistory: true,
        },
      )
    }
    return null
  }
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
    reGenerate: reGenerateMessage,
    inputValue,
    setInputValue,
    forceUpdateInputValue(text: string) {
      setInputValue(text)
      setTimeout(() => {
        updateInboxEditState((prevState) => ({
          ...prevState,
          step: (prevState.step || 0) + 1,
        }))
      }, 0)
    },
    stopGenerateMessage,
    pushMessage,
  }
}
export { useMessageWithChatGPT }
