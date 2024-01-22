import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { MaxAIFreeChat } from '@/background/src/chat'
import { IMaxAIChatMessage } from '@/background/src/chat/UseChatGPTChat/types'
import { IChatConversation } from '@/background/src/chatConversations'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'

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
  async createConversation(initConversationData: Partial<IChatConversation>) {
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
    const messageId = uuidV4()
    const chat_history: IMaxAIChatMessage[] = []
    if (this.maxAIFreeChat.conversation) {
      if (this.maxAIFreeChat.conversation.meta.systemPrompt) {
        chat_history.push({
          role: 'system',
          content: [
            {
              type: 'text',
              text: this.maxAIFreeChat.conversation.meta.systemPrompt,
            },
          ],
        })
      }
      if (question.meta) {
        question.meta.historyMessages?.forEach((message) => {
          chat_history.push({
            role:
              message.type === 'ai'
                ? 'ai'
                : message.type === 'user'
                ? 'human'
                : 'system',
            content: [
              {
                type: 'text',
                text: message.text,
              },
            ],
          })
        })
        question.meta.includeHistory = false
        question.meta.maxHistoryMessageCnt = 0
      }
    }
    await this.maxAIFreeChat.askChatGPT(
      [
        {
          type: 'text',
          text: question.text,
        },
      ],
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