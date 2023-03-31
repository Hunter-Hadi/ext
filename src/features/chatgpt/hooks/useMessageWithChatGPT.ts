import { useRecoilState, useSetRecoilState } from 'recoil'
import { useEffect, useRef } from 'react'
import { v4 as uuidV4 } from 'uuid'
import {
  ChatGPTMessageState,
  ChatGPTConversationState,
  ChatGPTInputState,
  InboxEditState,
} from '@/features/gmail/store'
import { pingDaemonProcess, useSendAsyncTask } from '@/features/chatgpt/utils'
import { IGmailChatMessage } from '@/features/gmail/components/GmailChatBox'

const useMessageWithChatGPT = (defaultInputValue?: string) => {
  const sendAsyncTask = useSendAsyncTask()
  const updateInboxEditState = useSetRecoilState(InboxEditState)
  const defaultValueRef = useRef<string>(defaultInputValue || '')
  const [messages, setMessages] = useRecoilState(ChatGPTMessageState)
  const [inputValue, setInputValue] = useRecoilState(ChatGPTInputState)
  const [conversation, setConversation] = useRecoilState(
    ChatGPTConversationState,
  )
  const resetConversation = () => {
    console.log('resetConversation', defaultValueRef.current)
    setInputValue(defaultValueRef.current)
    setMessages([])
    setConversation((prevState) => {
      if (prevState.conversationId) {
        console.log('remove Conversation', prevState.conversationId)
        sendAsyncTask('DaemonProcess_removeConversation', {
          conversationId: prevState.conversationId,
        })
          .then()
          .catch()
      }
      return {
        model: prevState.model,
        conversationId: '',
        writingMessage: null,
        loading: false,
      }
    })
  }
  const createConversation = async () => {
    console.log(conversation.model)
    const response: any = await sendAsyncTask(
      'DaemonProcess_createConversation',
      {
        model: conversation.model,
      },
    )
    if (response.conversationId) {
      console.log('create Conversation done', response.conversationId)
      console.log(response.conversationId)
      setConversation((prevState) => {
        return {
          ...prevState,
          conversationId: response.conversationId,
          writingMessage: null,
          lastMessageId: '',
        }
      })
      return response.conversationId as string
    } else {
      console.log('create Conversation error', response)
      return ''
    }
  }
  const createSystemMessage = (
    parentMessageId: string,
    error: string,
    status: 'success' | 'error',
  ) => {
    setMessages((prevState) => {
      return [
        ...prevState,
        {
          type: 'system',
          messageId: uuidV4(),
          parentMessageId,
          text: error,
          status,
        },
      ]
    })
  }
  const sendQuestion = async (
    question: string,
    messageId?: string,
    parentMessageId?: string,
  ): Promise<{ success: boolean; answer: string }> => {
    if (!question || conversation.loading) {
      return Promise.resolve({
        success: false,
        answer: '',
      })
    }
    console.log('[ChatGPT Module] send question step 0 ping')
    await pingDaemonProcess()
    console.log('[ChatGPT Module] send question step 1')
    const currentMessageId = messageId || uuidV4()
    let currentParentMessageId = parentMessageId || ''
    if (!currentParentMessageId) {
      // 说明不是retry或者regenerate
      for (let i = messages.length - 1; i >= 0; i--) {
        const message = messages[i]
        if (message.type !== 'system') {
          if (message.type === 'ai') {
            currentParentMessageId = message.messageId
          } else if (message.type === 'user') {
            currentParentMessageId = message.parentMessageId || uuidV4()
          }
          break
        }
      }
      if (!currentParentMessageId) {
        currentParentMessageId = uuidV4()
      }
    }
    let postConversationId: string = conversation.conversationId || ''
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
    console.log('[ChatGPT Module] send question step 2')
    // 创建会话id不一定报错，所以加一个flag防止出现2个错误提示
    let isSetError = false
    try {
      if (!conversation.conversationId) {
        postConversationId = (await createConversation()) || ''
      }
    } catch (e) {
      console.error(`create Conversation error`, e)
      isSetError = true
      createSystemMessage(
        currentMessageId,
        `Error detected. Please try again.`,
        'error',
      )
    }
    if (!postConversationId) {
      if (!isSetError) {
        createSystemMessage(
          currentMessageId,
          `Error detected. Please try again.`,
          'error',
        )
      }
      setConversation((prevState) => {
        return {
          ...prevState,
          loading: false,
        }
      })
      return Promise.resolve({
        success: false,
        answer: '',
      })
    }
    console.log(
      '[ChatGPT Module] send question step 3',
      currentMessageId,
      parentMessageId,
      postConversationId,
    )
    const pushMessages: IGmailChatMessage[] = []
    let hasError = false
    try {
      let currentMessage: any = null
      await sendAsyncTask(
        'DaemonProcess_sendMessage',
        {
          messageId: currentMessageId,
          parentMessageId: currentParentMessageId,
          conversationId: postConversationId,
          question,
        },
        {
          onMessage: (msg) => {
            console.log('[ChatGPT Module] send question onmessage', msg)
            const writingMessage = {
              messageId: (msg.messageId as string) || uuidV4(),
              parentMessageId: (msg.parentMessageId as string) || uuidV4(),
              text: (msg.text as string) || '',
              type: 'ai' as const,
            }
            currentMessage = writingMessage
            setConversation((prevState) => {
              return {
                ...prevState,
                conversationId: msg.conversationId || prevState.conversationId,
                loading: true,
                writingMessage,
              }
            })
          },
          onError: (error: any) => {
            hasError = true
            console.log('[ChatGPT Module] send question onerror', error)
            if (currentMessage?.messageId) {
              pushMessages.push(currentMessage as IGmailChatMessage)
            }
            const is403Error = error?.trim() === '403'
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
                text = 'Too many requests. Try again in a few seconds.'
              }
              pushMessages.push({
                type: 'system',
                status: 'error',
                messageId: uuidV4(),
                parentMessageId: currentMessageId,
                text,
              })
            }
            console.log('onerror', error, pushMessages)
            return
          },
        },
      )
      if (!hasError && currentMessage?.messageId && currentMessage?.text) {
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
      console.error(`send question error`, e)
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
        originMessage.text,
        uuidV4(),
        originMessage.parentMessageId,
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
        lastUserMessage.text,
        lastUserMessage.messageId,
        lastUserMessage.parentMessageId,
      )
    }
    return null
  }
  const stopGenerateMessage = async () => {
    const parentMessageId = conversation.writingMessage?.parentMessageId
    if (parentMessageId || conversation.lastMessageId) {
      await pingDaemonProcess()
      await sendAsyncTask('DaemonProcess_abortMessage', {
        messageId: parentMessageId || conversation.lastMessageId,
      })
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
