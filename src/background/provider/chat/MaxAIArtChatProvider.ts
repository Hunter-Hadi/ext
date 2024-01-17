import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { MaxAIArtChat } from '@/background/src/chat'
import { IMaxAIChatMessage } from '@/background/src/chat/UseChatGPTChat/types'
import { IChatConversation } from '@/background/src/chatConversations'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'

class MaxAIArtChatProvider implements ChatAdapterInterface {
  private maxAIArtChat: MaxAIArtChat

  constructor(maxAIArtChat: MaxAIArtChat) {
    this.maxAIArtChat = maxAIArtChat
  }
  async auth(authTabId: number) {
    await this.maxAIArtChat.auth(authTabId)
  }
  async preAuth() {
    await this.maxAIArtChat.preAuth()
  }
  get status() {
    return this.maxAIArtChat.status
  }
  get conversation() {
    return this.maxAIArtChat.conversation
  }
  async createConversation(initConversationData: Partial<IChatConversation>) {
    return await this.maxAIArtChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    await this.maxAIArtChat.removeConversationWithCache()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    const messageId = uuidV4()
    const chat_history: IMaxAIChatMessage[] = []
    if (this.maxAIArtChat.conversation) {
      if (this.maxAIArtChat.conversation.meta.systemPrompt) {
        chat_history.push({
          role: 'system',
          content: [
            {
              type: 'text',
              text: this.maxAIArtChat.conversation.meta.systemPrompt,
            },
          ],
        })
      }
      if (question.meta) {
        question.meta.historyMessages?.forEach((message) => {
          chat_history.push({
            role: message.type === 'ai' ? 'ai' : 'human',
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
    await this.maxAIArtChat.askChatGPT(
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
    return await this.maxAIArtChat.abortTask(messageId)
  }
  async destroy() {
    await this.maxAIArtChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.maxAIArtChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.maxAIArtChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.maxAIArtChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.maxAIArtChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.maxAIArtChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.maxAIArtChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.maxAIArtChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.maxAIArtChat.clearFiles()
  }
}
export { MaxAIArtChatProvider }
