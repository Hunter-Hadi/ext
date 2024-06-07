import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { BingChat } from '@/background/src/chat'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'

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
  get conversation() {
    return this.bingChat.conversation
  }
  async createConversation(initConversationData: Partial<IConversation>) {
    if (
      initConversationData?.id &&
      this.bingChat.conversation?.id &&
      initConversationData.id !== this.bingChat.conversation.id
    ) {
      console.log('新版Conversation 因为conversation id变了, 移除conversation')
      await this.bingChat.removeConversation()
    }
    return await this.bingChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    await this.bingChat.removeConversationWithCache()
    await this.bingChat.removeConversation()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    const messageId = uuidV4()
    await this.bingChat.askChatGPT(
      question.text,
      {
        taskId: question.messageId,
        regenerate: question.meta?.regenerate,
        include_history: question.meta?.includeHistory,
        max_history_message_cnt: question.meta?.maxHistoryMessageCnt,
        clientTabId: sender.tab?.id,
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
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
  async getUploadFileToken() {
    return await this.bingChat.getUploadFileToken()
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
