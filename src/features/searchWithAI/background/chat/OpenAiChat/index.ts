import { ChatStatus } from '@/background/provider/chat'
import BaseChat from '@/background/src/chat/BaseChat'
import { backgroundSendAllClientMessage } from '@/background/utils'
import {
  ChatGPTConversation,
  ChatGPTDaemonProcess,
} from '@/features/chatgpt/core'
// import { ChatGPTConversation } from '@/features/chatgpt/coreBackup'
import Log from '@/utils/Log'

const log = new Log('SearchWithAI/OpenAIChat')

class OpenAIChat extends BaseChat {
  openAILib: ChatGPTDaemonProcess
  status: ChatStatus = 'success'
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
    await this.updateClientStatus()
  }
  async createConversation() {
    this.conversation = await this.openAILib.createConversation()
    return this.conversation
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
  async updateClientStatus() {
    if (this.active) {
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
      })
    }
  }
}

export { OpenAIChat }
