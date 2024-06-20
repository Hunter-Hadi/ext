import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { maxAIAPISendQuestion } from '@/background/provider/chat/maxai-providers/index'
import { MaxAIFreeChat } from '@/background/src/chat'
import { MAXAI_FREE_MODELS } from '@/background/src/chat/MaxAIFreeChat/types'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'

class MaxAIFreeChatProvider implements ChatAdapterInterface {
  private maxAIFreeChat: MaxAIFreeChat

  constructor(maxAIFreeChat: MaxAIFreeChat) {
    this.maxAIFreeChat = maxAIFreeChat
  }
  async auth(authTabId: number) {
    await this.maxAIFreeChat.auth(authTabId)
  }
  async preAuth() {
    await this.maxAIFreeChat.preAuth()
  }
  get status() {
    return this.maxAIFreeChat.status
  }
  get conversation() {
    return this.maxAIFreeChat.conversation
  }
  async createConversation(initConversationData: Partial<IConversation>) {
    return await this.maxAIFreeChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    await this.maxAIFreeChat.removeConversationWithCache()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    await maxAIAPISendQuestion(taskId, sender, question, {
      conversationId:
        question.conversationId || this.maxAIFreeChat.conversation?.id || '',
      AIProvider: 'MAXAI_FREE',
      AIModel:
        this.maxAIFreeChat.conversation?.meta.AIModel ||
        MAXAI_FREE_MODELS[0].value,
      checkAuthStatus: async () => {
        await this.auth(sender.tab?.id || 0)
        return this.status === 'success'
      },
      beforeSend: async () => {
        this.clearFiles()
      },
      setAbortController: (abortController) => {
        this.maxAIFreeChat.taskList[taskId] = () => abortController.abort()
      },
      afterSend: async (reason) => {
        if (reason === 'token_expired') {
          this.maxAIFreeChat.status = 'needAuth'
          await this.maxAIFreeChat.updateClientConversationChatStatus()
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
    return await this.maxAIFreeChat.abortTask(messageId)
  }
  async destroy() {
    await this.maxAIFreeChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.maxAIFreeChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.maxAIFreeChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.maxAIFreeChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.maxAIFreeChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.maxAIFreeChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.maxAIFreeChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.maxAIFreeChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.maxAIFreeChat.clearFiles()
  }
}
export { MaxAIFreeChatProvider }
