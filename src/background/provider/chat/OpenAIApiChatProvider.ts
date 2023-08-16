import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { OpenAiApiChat } from '@/background/src/chat'
import { setChromeExtensionSettings } from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { v4 as uuidV4 } from 'uuid'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { IChatConversation } from '@/background/src/chatConversations'

class OpenAIApiChatProvider implements ChatAdapterInterface {
  private openAiApiChat: OpenAiApiChat

  constructor(openAiApiChat: OpenAiApiChat) {
    this.openAiApiChat = openAiApiChat
  }
  async auth(authTabId: number) {
    await this.openAiApiChat.auth()
  }
  async preAuth() {
    await this.openAiApiChat.preAuth()
  }
  get status() {
    // NOTE: This is a hack to make sure the status is updated
    this.openAiApiChat.checkApiKey()
    return this.openAiApiChat.status
  }
  get conversation() {
    return this.openAiApiChat.conversation
  }
  async createConversation(initConversationData: Partial<IChatConversation>) {
    if (this.openAiApiChat.conversation?.id) {
      return Promise.resolve(this.openAiApiChat.conversation.id)
    }
    const conversationId = await this.openAiApiChat.createConversation(
      initConversationData,
    )
    return Promise.resolve(conversationId)
  }
  async removeConversation(conversationId: string) {
    this.openAiApiChat.conversation = undefined
    await setChromeExtensionSettings({
      conversationId: '',
    })
    await this.openAiApiChat.resetMessagesContext()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    const messageId = uuidV4()
    await this.openAiApiChat.askChatGPT(
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
    return await this.openAiApiChat.abortTask(messageId)
  }
  async destroy() {
    await this.openAiApiChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.openAiApiChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.openAiApiChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.openAiApiChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.openAiApiChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.openAiApiChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.openAiApiChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.openAiApiChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.openAiApiChat.clearFiles()
  }
}
export { OpenAIApiChatProvider }
