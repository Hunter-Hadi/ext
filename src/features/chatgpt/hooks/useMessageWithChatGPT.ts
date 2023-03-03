import { useRecoilState, useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '../store'
import { useEffect, useMemo, useRef } from 'react'
import { v4 as uuidV4 } from 'uuid'
import {
  GmailMessageChatState,
  GmailMessageChatConversationState,
  IGmailChatMessage,
  GmailMessageChatInputState,
} from '../../gmail'
import { pingDaemonProcess, useSendAsyncTask } from '../utils'

const useMessageWithChatGPT = (defaultInputValue?: string) => {
  const sendAsyncTask = useSendAsyncTask()
  const defaultValueRef = useRef<string>(defaultInputValue || '')
  const { status, loaded, port } = useRecoilValue(ChatGPTClientState)
  const [messages, setMessages] = useRecoilState(GmailMessageChatState)
  const [inputValue, setInputValue] = useRecoilState(GmailMessageChatInputState)
  const [conversation, setConversation] = useRecoilState(
    GmailMessageChatConversationState,
  )
  const writingMessageRef = useRef<IGmailChatMessage | null>(null)
  const currentPortInstance = useMemo(() => {
    if (loaded && status === 'success') {
      return port
    }
    return undefined
  }, [status, port, loaded])
  const resetConversation = () => {
    console.log('resetConversation', defaultValueRef.current)
    setInputValue(defaultValueRef.current)
    setMessages([])
    writingMessageRef.current = null
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
        conversationId: '',
        writingMessage: null,
        loading: false,
      }
    })
  }
  const createConversation = async () => {
    if (currentPortInstance) {
      const response: any = await sendAsyncTask(
        'DaemonProcess_createConversation',
        {},
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
        return ''
      }
    }
    return ''
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
    console.log(1)
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
    console.log(2)
    try {
      if (!conversation.conversationId) {
        postConversationId = (await createConversation()) || ''
      }
    } catch (e) {
      console.error(`create Conversation error`, e)
      createSystemMessage(
        currentMessageId,
        `Error detected. Please try again.`,
        'error',
      )
    }
    if (!postConversationId || !currentPortInstance) {
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
    console.log(3)
    console.log(
      'useMessageWithChatGPT start',
      currentMessageId,
      parentMessageId,
      postConversationId,
    )
    const pushMessages: IGmailChatMessage[] = []
    let hasError = false
    try {
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
            console.log('useMessageWithChatGPT onmessage', msg)
            const writingMessage = {
              messageId: (msg.messageId as string) || uuidV4(),
              parentMessageId: (msg.parentMessageId as string) || uuidV4(),
              text: (msg.text as string) || '',
              type: 'ai' as const,
            }
            writingMessageRef.current = writingMessage
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
            console.log('!!!!!!', error)
            if (writingMessageRef.current?.messageId) {
              pushMessages.push(writingMessageRef.current as IGmailChatMessage)
            }
            if (error === 'Conversation not found') {
              setConversation((prevState) => {
                return {
                  ...prevState,
                  conversationId: '',
                }
              })
            }
            if (error !== 'manual aborted request.') {
              pushMessages.push({
                type: 'system',
                status: 'error',
                messageId: uuidV4(),
                parentMessageId: currentMessageId,
                text:
                  error?.message ||
                  error ||
                  'Error detected. Please try again.',
              })
            }
            console.log('onerror', error, pushMessages)
            // setMessages((prevState) => {
            //   const pushMessages: IGmailChatMessage[] = []
            //   if (writingMessageRef.current?.messageId) {
            //     pushMessages.push(
            //       writingMessageRef.current as IGmailChatMessage,
            //     )
            //   }
            //   pushMessages.push({
            //     type: 'system',
            //     status: 'error',
            //     messageId: uuidV4(),
            //     parentMessageId: currentMessageId,
            //     text: msg || 'Error detected. Please try again.',
            //   })
            //   return [...prevState, ...pushMessages]
            // })
            return
          },
        },
      )
      if (
        !hasError &&
        writingMessageRef.current?.messageId &&
        writingMessageRef.current?.text
      ) {
        pushMessages.push(writingMessageRef.current as IGmailChatMessage)
        return Promise.resolve({
          success: true,
          answer: writingMessageRef.current?.text || '',
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
    const parentMessageId = writingMessageRef.current?.parentMessageId
    if (parentMessageId || conversation.lastMessageId) {
      await pingDaemonProcess()
      await sendAsyncTask('DaemonProcess_abortMessage', {
        messageId: parentMessageId || conversation.lastMessageId,
      })
    }
  }
  useEffect(() => {
    if (defaultInputValue) {
      defaultValueRef.current = defaultInputValue
    }
  }, [defaultInputValue])
  useEffect(() => {
    setInputValue(defaultValueRef.current || '')
  }, [])
  return {
    sendQuestion,
    writingMessageRef,
    messages,
    resetConversation,
    conversation,
    retryMessage,
    reGenerate: reGenerateMessage,
    inputValue,
    setInputValue,
    stopGenerateMessage,
  }
}
export { useMessageWithChatGPT }
