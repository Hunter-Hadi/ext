import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { maxAIAPISendQuestion } from '@/background/provider/chat/maxai-providers/index'
import { MaxAIDALLEChat } from '@/background/src/chat'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { MAXAI_IMAGE_GENERATE_MODELS } from '@/features/art/constant'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'

class MaxAIDALLEChatProvider implements ChatAdapterInterface {
  private maxAIDALLEChat: MaxAIDALLEChat

  constructor(maxAIArtChat: MaxAIDALLEChat) {
    this.maxAIDALLEChat = maxAIArtChat
  }
  async auth(authTabId: number) {
    await this.maxAIDALLEChat.auth(authTabId)
  }
  async preAuth() {
    await this.maxAIDALLEChat.preAuth()
  }
  get status() {
    return this.maxAIDALLEChat.status
  }
  get conversation() {
    return this.maxAIDALLEChat.conversation
  }
  async createConversation(initConversationData: Partial<IConversation>) {
    return await this.maxAIDALLEChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    await this.maxAIDALLEChat.removeConversationWithCache()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    await maxAIAPISendQuestion(taskId, sender, question, {
      conversationId:
        question.conversationId || this.maxAIDALLEChat.conversation?.id || '',
      AIProvider: 'MAXAI_DALLE',
      AIModel:
        this.maxAIDALLEChat.conversation?.meta.AIModel ||
        MAXAI_IMAGE_GENERATE_MODELS[0].value,
      checkAuthStatus: async () => {
        // await this.auth(sender.tab?.id || 0)
        await this.maxAIDALLEChat.checkTokenAndUpdateStatus()
        return this.status === 'success'
      },
      beforeSend: async () => {
        this.clearFiles()
      },
      setAbortController: (abortController) => {
        this.maxAIDALLEChat.taskList[taskId] = () => abortController.abort()
      },
      afterSend: async (reason) => {
        if (reason === 'token_expired') {
          this.maxAIDALLEChat.status = 'needAuth'
          await this.maxAIDALLEChat.updateClientConversationChatStatus()
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
    return await this.maxAIDALLEChat.abortTask(messageId)
  }
  async destroy() {
    await this.maxAIDALLEChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.maxAIDALLEChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.maxAIDALLEChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.maxAIDALLEChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.maxAIDALLEChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.maxAIDALLEChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.maxAIDALLEChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.maxAIDALLEChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.maxAIDALLEChat.clearFiles()
  }
}
export { MaxAIDALLEChatProvider }
