import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { maxAIAPISendQuestion } from '@/background/provider/chat/maxai-providers/index'
import { MaxAIChat } from '@/background/src/chat'
import { MAXAI_LLAMA_MODELS } from '@/background/src/chat/MaxAILlamaChat/types'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'

class MaxAILlamaChatProvider implements ChatAdapterInterface {
  private maxAIChat: MaxAIChat

  constructor(maxAIChat: MaxAIChat) {
    this.maxAIChat = maxAIChat
  }
  async auth(authTabId: number) {
    await this.maxAIChat.auth(authTabId)
  }
  async preAuth() {
    await this.maxAIChat.preAuth()
  }
  get status() {
    return this.maxAIChat.status
  }
  get conversation() {
    return this.maxAIChat.conversation
  }
  async createConversation(initConversationData: Partial<IConversation>) {
    return await this.maxAIChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    await this.maxAIChat.removeConversationWithCache()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    await maxAIAPISendQuestion(taskId, sender, question, {
      conversationId:
        question.conversationId || this.maxAIChat.conversation?.id || '',
      AIProvider: 'MAXAI_LLAMA',
      AIModel:
        this.maxAIChat.conversation?.meta.AIModel ||
        MAXAI_LLAMA_MODELS[0].value,
      checkAuthStatus: async () => {
        // await this.auth(sender.tab?.id || 0)
        await this.maxAIChat.checkTokenAndUpdateStatus()
        return this.status === 'success'
      },
      beforeSend: async () => {
        this.clearFiles()
      },
      setAbortController: (abortController) => {
        this.maxAIChat.taskList[taskId] = () => abortController.abort()
      },
      afterSend: async (reason) => {
        if (reason === 'token_expired') {
          this.maxAIChat.status = 'needAuth'
          await this.maxAIChat.updateClientConversationChatStatus()
        }
      },
      onMessage: async ({ data, done, error, type }) => {
        if (sender.tab?.id) {
          await this.sendResponseToClient(sender.tab.id, {
            taskId,
            data: {
              text: data.text,
              parentMessageId: question.messageId,
              conversationId: data.conversationId,
              originalMessage: data.originalMessage,
              messageId: uuidV4(),
            },
            error,
            done,
          })
        }
      },
    })
  }
  async abortAskQuestion(messageId: string) {
    return await this.maxAIChat.abortTask(messageId)
  }
  async destroy() {
    await this.maxAIChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.maxAIChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.maxAIChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.maxAIChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.maxAIChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.maxAIChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.maxAIChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.maxAIChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.maxAIChat.clearFiles()
  }
}

export { MaxAILlamaChatProvider }
