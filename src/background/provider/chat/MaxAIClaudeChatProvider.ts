import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { MaxAIClaudeChat } from '@/background/src/chat'
import { IMaxAIClaudeMessageType } from '@/background/src/chat/MaxAIClaudeChat/types'
import { IChatConversation } from '@/background/src/chatConversations'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'

class MaxAIClaudeChatProvider implements ChatAdapterInterface {
  private maxAIClaudeChat: MaxAIClaudeChat

  constructor(maxAIClaudeChat: MaxAIClaudeChat) {
    this.maxAIClaudeChat = maxAIClaudeChat
  }
  async auth(authTabId: number) {
    await this.maxAIClaudeChat.auth(authTabId)
  }
  async preAuth() {
    await this.maxAIClaudeChat.preAuth()
  }
  get status() {
    return this.maxAIClaudeChat.status
  }
  get conversation() {
    return this.maxAIClaudeChat.conversation
  }
  async createConversation(initConversationData: Partial<IChatConversation>) {
    return await this.maxAIClaudeChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    await this.maxAIClaudeChat.removeConversationWithCache()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    const messageId = uuidV4()
    const chat_history: IMaxAIClaudeMessageType[] = []
    if (this.maxAIClaudeChat.conversation) {
      if (this.maxAIClaudeChat.conversation.meta.systemPrompt) {
        chat_history.push({
          type: 'system',
          data: {
            content: this.maxAIClaudeChat.conversation.meta.systemPrompt,
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
    await this.maxAIClaudeChat.askChatGPT(
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
    return await this.maxAIClaudeChat.abortTask(messageId)
  }
  async destroy() {
    await this.maxAIClaudeChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.maxAIClaudeChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.maxAIClaudeChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.maxAIClaudeChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.maxAIClaudeChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.maxAIClaudeChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.maxAIClaudeChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.maxAIClaudeChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.maxAIClaudeChat.clearFiles()
  }
}
export { MaxAIClaudeChatProvider }
