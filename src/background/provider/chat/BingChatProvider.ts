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
  private bindChat: BingChat

  constructor(bindChat: BingChat) {
    this.bindChat = bindChat
  }
  async auth(authTabId: number) {
    await this.bindChat.auth()
  }
  async preAuth() {
    // 进入聊天界面再进行认证
    await this.bindChat.auth()
  }
  get status() {
    return this.bindChat.status
  }
  async createConversation() {
    return Promise.resolve('')
  }
  async removeConversation(conversationId: string) {
    await setChromeExtensionSettings({
      conversationId: '',
    })
    await this.bindChat.removeConversation(conversationId)
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    await this.bindChat.askChatGPT(
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
              messageId: uuidV4(),
            },
            error,
            done,
          })
        }
      },
    )
  }
  async abortAskQuestion(messageId: string) {
    return await this.bindChat.abortTask(messageId)
  }
  async destroy() {
    await this.bindChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.bindChat.chatFiles
  }
  async uploadFile(file: IChatUploadFile) {
    return await this.bindChat.uploadFile(file)
  }
  async removeFile(fileId: string) {
    return await this.bindChat.removeFile(fileId)
  }
  async getFiles() {
    return await this.bindChat.getFiles()
  }
  async abortUploadFile(fileId: string) {
    return await this.bindChat.abortUploadFile(fileId)
  }
  async clearFiles() {
    return await this.bindChat.clearFiles()
  }
}
export { BingChatProvider }
