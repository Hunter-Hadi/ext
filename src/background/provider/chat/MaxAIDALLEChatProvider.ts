import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { MaxAIDALLEChat } from '@/background/src/chat'
import { IMaxAIRequestHistoryMessage } from '@/background/src/chat/UseChatGPTChat/types'
import { chatMessageToMaxAIRequestMessage } from '@/background/src/chat/util'
import { IChatConversation } from '@/background/src/chatConversations'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'

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
  async createConversation(initConversationData: Partial<IChatConversation>) {
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
    const messageId = uuidV4()
    const chat_history: IMaxAIRequestHistoryMessage[] = []
    if (this.maxAIDALLEChat.conversation) {
      if (this.maxAIDALLEChat.conversation.meta.systemPrompt) {
        chat_history.push({
          role: 'system',
          content: [
            {
              type: 'text',
              text: this.maxAIDALLEChat.conversation.meta.systemPrompt,
            },
          ],
        })
      }
      if (question.meta) {
        question.meta.historyMessages?.forEach((message) => {
          chat_history.push(chatMessageToMaxAIRequestMessage(message, true))
        })
        question.meta.includeHistory = false
        question.meta.maxHistoryMessageCnt = 0
      }
    }
    const questionMessage = chatMessageToMaxAIRequestMessage(question)
    await this.maxAIDALLEChat.askChatGPT(
      questionMessage.content,
      {
        taskId: question.messageId,
        chat_history,
        meta: question.meta,
      },
      async ({ type, done, error, data }) => {
        if (sender.tab?.id) {
          await this.sendResponseToClient(sender.tab.id, {
            taskId,
            data: {
              text: data.text,
              parentMessageId: question.messageId,
              conversationId: data.conversationId,
              messageId,
            },
            error,
            done,
          })
        }
      },
    )
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
