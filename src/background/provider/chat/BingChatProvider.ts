import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { BingChat } from '@/background/src/chat'
import { setChromeExtensionSettings } from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { v4 as uuidV4 } from 'uuid'
import { IChatUploadFile } from '@/features/chatgpt/types'

class BingChatProvider implements ChatAdapterInterface {
  private bingChat: BingChat

  constructor(bingChat: BingChat) {
    this.bingChat = bingChat
  }
  async auth(authTabId: number) {
    await this.bingChat.auth()
  }
  async preAuth() {
    // 进入聊天界面再进行认证
    await this.bingChat.auth()
  }
  get status() {
    return this.bingChat.status
  }
  async createConversation() {
    return Promise.resolve('')
  }
  async removeConversation(conversationId: string) {
    await setChromeExtensionSettings({
      conversationId: '',
    })
    await this.bingChat.removeConversation(conversationId)
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    const messageId = uuidV4()
    await this.bingChat.askChatGPT(
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
    return await this.bingChat.abortTask(messageId)
  }
  async destroy() {
    await this.bingChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.bingChat.chatFiles
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.bingChat.updateFiles(files)
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.bingChat.uploadFiles(files)
  }
  async removeFiles(fileIds: string[]) {
    return await this.bingChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.bingChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.bingChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.bingChat.clearFiles()
  }
}
export { BingChatProvider }
