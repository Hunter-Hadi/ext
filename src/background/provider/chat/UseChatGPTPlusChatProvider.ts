import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { UseChatGPTPlusChat } from '@/background/src/chat'
import { setChromeExtensionSettings } from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { v4 as uuidV4 } from 'uuid'
import { IChatUploadFile } from '@/features/chatgpt/types'

class UseChatGPTPlusChatProvider implements ChatAdapterInterface {
  private useChatGPTPlusChat: UseChatGPTPlusChat

  constructor(useChatGPTPlusChat: UseChatGPTPlusChat) {
    this.useChatGPTPlusChat = useChatGPTPlusChat
  }
  async auth(authTabId: number) {
    await this.useChatGPTPlusChat.auth(authTabId)
  }
  async preAuth() {
    await this.useChatGPTPlusChat.preAuth()
  }
  get status() {
    return this.useChatGPTPlusChat.status
  }
  async createConversation() {
    return Promise.resolve('')
  }
  async removeConversation(conversationId: string) {
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
    await this.useChatGPTPlusChat.askChatGPT(
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
    return await this.useChatGPTPlusChat.abortTask(messageId)
  }
  async destroy() {
    await this.useChatGPTPlusChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.useChatGPTPlusChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.useChatGPTPlusChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.useChatGPTPlusChat.updateFiles(files)
  }
  async removeFiles(fileIds: string[]) {
    return await this.useChatGPTPlusChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.useChatGPTPlusChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.useChatGPTPlusChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.useChatGPTPlusChat.clearFiles()
  }
}
export { UseChatGPTPlusChatProvider }
