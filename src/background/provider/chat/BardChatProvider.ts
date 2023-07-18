import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { BardChat } from '@/background/src/chat'
import { setChromeExtensionSettings } from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { v4 as uuidV4 } from 'uuid'
import { IChatUploadFile } from '@/features/chatgpt/types'

class BardChatProvider implements ChatAdapterInterface {
  private bardChat: BardChat

  constructor(bardChat: BardChat) {
    this.bardChat = bardChat
  }
  async auth(authTabId: number) {
    await this.bardChat.auth()
  }
  async preAuth() {
    await this.bardChat.checkAuth()
  }
  get status() {
    return this.bardChat.status
  }
  async createConversation() {
    return Promise.resolve('')
  }
  async removeConversation(conversationId: string) {
    await this.bardChat.reset()
    await setChromeExtensionSettings({
      conversationId: '',
    })
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    const messageId = uuidV4()
    await this.bardChat.askChatGPT(
      question.question,
      {
        taskId: question.messageId,
        regenerate: options.regenerate,
        include_history: options.includeHistory,
        max_history_message_cnt: options.maxHistoryMessageCnt,
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
    return await this.bardChat.abortTask(messageId)
  }
  async destroy() {
    await this.bardChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.bardChat.chatFiles
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.bardChat.updateFiles(files)
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.bardChat.uploadFiles(files)
  }
  async removeFiles(fileIds: string[]) {
    return await this.bardChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.bardChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.bardChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.bardChat.clearFiles()
  }
}
export { BardChatProvider }
