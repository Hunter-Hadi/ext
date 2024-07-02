import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { maxAIAPISendQuestion } from '@/background/provider/chat/maxai-providers/index'
import { MaxAIGeminiChat } from '@/background/src/chat'
import { MAXAI_GENMINI_MODELS } from '@/background/src/chat/MaxAIGeminiChat/types'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'

class MaxAIGeminiChatProvider implements ChatAdapterInterface {
  private maxAIGeminiChat: MaxAIGeminiChat

  constructor(maxAIGeminiChat: MaxAIGeminiChat) {
    this.maxAIGeminiChat = maxAIGeminiChat
  }
  async auth(authTabId: number) {
    await this.maxAIGeminiChat.auth(authTabId)
  }
  async preAuth() {
    await this.maxAIGeminiChat.preAuth()
  }
  get status() {
    return this.maxAIGeminiChat.status
  }
  get conversation() {
    return this.maxAIGeminiChat.conversation
  }
  async createConversation(initConversationData: Partial<IConversation>) {
    return await this.maxAIGeminiChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    await this.maxAIGeminiChat.removeConversationWithCache()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    await maxAIAPISendQuestion(taskId, sender, question, {
      conversationId:
        question.conversationId || this.maxAIGeminiChat.conversation?.id || '',
      AIProvider: 'MAXAI_GEMINI',
      AIModel:
        this.maxAIGeminiChat.conversation?.meta.AIModel ||
        MAXAI_GENMINI_MODELS[0].value,
      checkAuthStatus: async () => {
        // await this.auth(sender.tab?.id || 0)
        await this.maxAIGeminiChat.checkTokenAndUpdateStatus()
        return this.status === 'success'
      },
      beforeSend: async () => {
        this.clearFiles()
      },
      setAbortController: (abortController) => {
        this.maxAIGeminiChat.taskList[taskId] = () => abortController.abort()
      },
      afterSend: async (reason) => {
        if (reason === 'token_expired') {
          this.maxAIGeminiChat.status = 'needAuth'
          await this.maxAIGeminiChat.updateClientConversationChatStatus()
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
    return await this.maxAIGeminiChat.abortTask(messageId)
  }
  async destroy() {
    await this.maxAIGeminiChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.maxAIGeminiChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.maxAIGeminiChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.maxAIGeminiChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.maxAIGeminiChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.maxAIGeminiChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.maxAIGeminiChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.maxAIGeminiChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.maxAIGeminiChat.clearFiles()
  }
}
export { MaxAIGeminiChatProvider }
