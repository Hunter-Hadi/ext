import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'

import { OpenAIChat } from '../chat/OpenAiChat'

class OpenAIChatProvider implements ChatAdapterInterface {
  private openAIChat: OpenAIChat
  chatFiles: IChatUploadFile[]
  constructor(openAIChat: OpenAIChat) {
    this.chatFiles = []
    this.openAIChat = openAIChat
  }
  async preAuth() {
    return this.openAIChat.preAuth()
  }
  async auth(authTabId: number) {
    await this.openAIChat.auth(authTabId)
  }
  get status() {
    return this.openAIChat.status
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    const messageId = uuidV4()
    // await this.openAIChat.createConversation()

    const meta = question.meta || {}

    await this.openAIChat.askChatGPT(
      question.text,
      {
        taskId: question.messageId,
        regenerate: meta.regenerate,
        include_history: meta.includeHistory,
        max_history_message_cnt: meta.maxHistoryMessageCnt,
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
    try {
      await this.openAIChat.abortAskQuestion(messageId)
      return true
    } catch (error) {
      return false
    }
  }

  async createConversation() {
    // return await this.openAIChat.createConversation()
    return Promise.resolve('')
  }
  async removeConversation(conversationId: string) {
    return await this.openAIChat.removeConversation(conversationId)
  }
  destroy() {
    return this.openAIChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }

  abortUploadFiles(fileIds: string[]): Promise<boolean> {
    return Promise.resolve(false)
  }
  clearFiles(): Promise<boolean> {
    return Promise.resolve(false)
  }

  getFiles(): Promise<IChatUploadFile[]> {
    return Promise.resolve([])
  }

  getUploadFileToken(): Promise<any> {
    return Promise.resolve(undefined)
  }

  removeFiles(fileIds: string[]): Promise<boolean> {
    return Promise.resolve(false)
  }

  updateFiles(updateFiles: IChatUploadFile[]): Promise<void> {
    return Promise.resolve(undefined)
  }

  uploadFiles(file: IChatUploadFile[]): Promise<void> {
    return Promise.resolve(undefined)
  }
}
export { OpenAIChatProvider }
