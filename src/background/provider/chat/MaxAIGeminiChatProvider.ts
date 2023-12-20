import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { MaxAIGeminiChat } from '@/background/src/chat'
import { IMaxAIGeminiMessageType } from '@/background/src/chat/MaxAIGeminiChat/types'
import { IChatConversation } from '@/background/src/chatConversations'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'

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
  async createConversation(initConversationData: Partial<IChatConversation>) {
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
    options,
  ) => {
    const messageId = uuidV4()
    const chat_history: IMaxAIGeminiMessageType[] = []
    if (this.maxAIGeminiChat.conversation) {
      if (this.maxAIGeminiChat.conversation.meta.systemPrompt) {
        chat_history.push({
          type: 'system',
          data: {
            content: this.maxAIGeminiChat.conversation.meta.systemPrompt,
            additional_kwargs: {},
          },
        })
      }
      options.historyMessages?.forEach((message) => {
        chat_history.push({
          type: message.type === 'ai' ? 'ai' : 'human',
          data: {
            content: message.text,
            additional_kwargs: {},
          },
        })
      })
      options.includeHistory = false
      options.maxHistoryMessageCnt = 0
    }
    // NOTE: gemini的理解能力不行，需要把Human的回答过滤掉掉连续的
    if (chat_history.length > 0) {
      // 从后往前过滤连续的human
      for (let i = chat_history.length - 1; i >= 0; i--) {
        if (chat_history[i].type === 'human') {
          if (chat_history[i - 1]?.type === 'human') {
            chat_history.splice(i, 1)
          }
        }
      }
    }
    await this.maxAIGeminiChat.askChatGPT(
      question.question,
      {
        taskId: question.messageId,
        regenerate: options.regenerate,
        chat_history,
        meta: options.meta,
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
