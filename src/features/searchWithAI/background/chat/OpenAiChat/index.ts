import { v4 as uuidV4 } from 'uuid'

import { ConversationStatusType } from '@/background/provider/chat'
import BaseChat from '@/background/src/chat/BaseChat'
import ChatGPTSocketManager from '@/background/src/chat/OpenAIChat/socket'
import {
  ChatGPTConversation,
  ChatGPTDaemonProcess,
} from '@/features/searchWithAI/chatCore/chatgpt/core'
// import { ChatGPTConversation } from '@/features/chatgpt/coreBackup'
import Log from '@/utils/Log'

const log = new Log('SearchWithAI/OpenAIChat')

const CHAT_TITLE = 'MAXAI'

class OpenAIChat extends BaseChat {
  openAILib: ChatGPTDaemonProcess
  status: ConversationStatusType = 'success'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  conversation?: ChatGPTConversation

  constructor() {
    super('OpenAIChat')
    this.openAILib = new ChatGPTDaemonProcess()
    this.conversation = undefined
    this.init()
  }
  private init() {
    this.log.info('init')
  }
  async preAuth() {
    this.log.info('preAuth')
  }
  async auth(authTabId: number) {
    this.active = true
    this.status = 'success'
    await this.updateClientConversationChatStatus()
  }
  async createConversation() {
    this.conversation =
      (await this.openAILib.createConversation()) as ChatGPTConversation
    return this.conversation?.id || ''
  }
  async removeConversation(conversationId: string) {
    return await this.openAILib.closeConversation(conversationId)
  }
  async askChatGPT(
    question: string,
    options?: {
      taskId: string
      include_history?: boolean
      regenerate?: boolean
      streaming?: boolean
      max_history_message_cnt?: number
    },
    onMessage?: (message: {
      type: 'error' | 'message'
      done: boolean
      error: string
      data: {
        text: string
        conversationId: string
      }
    }) => void,
  ) {
    try {
      await this.createConversation()
    } catch (error: any) {
      onMessage?.({
        type: 'error',
        done: true,
        error: error.message || 'conversation is not created',
        data: {
          text: '',
          conversationId: '',
        },
      })
    }

    if (!this.openAILib.token) {
      onMessage?.({
        type: 'error',
        done: true,
        error: 'UNAUTHORIZED',
        data: {
          text: '',
          conversationId: '',
        },
      })
      return
    }

    if (!this.conversation) {
      onMessage?.({
        type: 'error',
        done: true,
        error: 'conversation is not created',
        data: {
          text: '',
          conversationId: '',
        },
      })
      return
    }
    const openAILib = this.openAILib
    const conversation = this.conversation
    const { taskId } = options || {}
    this.log.info('askChatGPT')
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    // 初始化socket
    ChatGPTSocketManager.socketService.init(this.openAILib.token || '')
    // 判断是否是socket
    const isSocket =
      await ChatGPTSocketManager.socketService.detectChatGPTWebappIsSocket()
    if (isSocket) {
      // 如果是socket, 在提问之前先连接socket
      const isConnectSuccess =
        await ChatGPTSocketManager.socketService.connect()
      if (isConnectSuccess) {
        const messageId = uuidV4()
        // 如果连接成功，监听question.messageId的消息
        ChatGPTSocketManager.socketService.onMessageIdListener(
          messageId,
          async (messageId, event) => {
            if (event.done) {
              taskId && openAILib.removeAbortWithMessageId(taskId)
              onMessage?.({
                type: 'message',
                done: true,
                error: '',
                data: {
                  text: '',
                  conversationId: conversation.conversationId!,
                },
              })
              conversation.updateTitle(CHAT_TITLE).catch(console.error)
            } else {
              onMessage?.({
                type: 'message',
                done: false,
                error: '',
                data: {
                  text: event.text,
                  conversationId: event.conversationId!,
                },
              })
            }
          },
        )

        await this.conversation.generateAnswer(
          {
            prompt: question,
            messageId: messageId,
            signal,
            streaming: false,
            onEvent(event) {
              log.info('generateAnswer', event, options)
            },
          },
          options?.regenerate === true,
        )
      } else {
        // 如果连接失败，直接返回错误
        onMessage?.({
          type: 'error',
          done: true,
          error: 'WS Connection failed',
          data: {
            text: '',
            conversationId: '',
          },
        })
      }
    } else {
      await this.conversation.generateAnswer(
        {
          prompt: question,
          signal,
          onEvent(event: any) {
            log.info('generateAnswer', event, options)
            if (event.type === 'error') {
              log.info('error')
              log.info('abort Controller remove', taskId)
              taskId && openAILib.removeAbortWithMessageId(taskId)
              onMessage?.({
                type: 'error',
                done: true,
                error: event.data.message || event.data.detail || '',
                data: {
                  text: '',
                  conversationId: '',
                },
              })
              return
            }
            if (event.type === 'done') {
              log.info('abort Controller remove', taskId)
              taskId && openAILib.removeAbortWithMessageId(taskId)
              onMessage?.({
                type: 'message',
                done: true,
                error: '',
                data: {
                  text: '',
                  conversationId: conversation.conversationId!,
                },
              })
              return
            }
            onMessage?.({
              type: 'message',
              done: false,
              error: '',
              data: {
                text: event.data.text,
                conversationId: conversation.conversationId!,
              },
            })
          },
        },
        options?.regenerate === true,
      )
    }
  }
  async abortAskQuestion(messageId: string) {
    if (this.taskList[messageId]) {
      this.taskList[messageId]()
      delete this.taskList[messageId]
    }
    return this.openAILib.abortWithMessageId(messageId)
  }
  async destroy() {
    this.openAILib.removeCacheConversation()
  }
}

export { OpenAIChat }
