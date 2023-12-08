import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { ClaudeWebappChat } from '@/background/src/chat/ClaudeWebappChat'
import { IChatConversation } from '@/background/src/chatConversations'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'

class ClaudeChatProvider implements ChatAdapterInterface {
  private claudeWebappChat: ClaudeWebappChat

  constructor(claudeWebappChat: ClaudeWebappChat) {
    this.claudeWebappChat = claudeWebappChat
  }
  async auth(authTabId: number) {
    await this.claudeWebappChat.auth()
  }
  async preAuth() {
    await this.claudeWebappChat.preAuth()
  }
  get status() {
    return this.claudeWebappChat.status
  }
  get conversation() {
    return this.claudeWebappChat.conversation
  }
  async createConversation(initConversationData: Partial<IChatConversation>) {
    if (
      initConversationData?.id &&
      this.claudeWebappChat.conversation?.id &&
      initConversationData.id !== this.claudeWebappChat.conversation.id
    ) {
      console.log('新版Conversation 因为conversation id变了, 移除conversation')
      await this.claudeWebappChat.removeConversation()
    }
    return await this.claudeWebappChat.createConversation(initConversationData)
  }
  async removeConversation() {
    await this.claudeWebappChat.removeConversationWithCache()
    await this.claudeWebappChat.removeConversation()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    const messageId = uuidV4()
    await this.claudeWebappChat.askChatGPT(
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
    return await this.claudeWebappChat.abortTask(messageId)
  }
  async destroy() {
    await this.claudeWebappChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.claudeWebappChat.chatFiles
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.claudeWebappChat.updateFiles(files)
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.claudeWebappChat.uploadFiles(files)
  }
  async getUploadFileToken() {
    return await this.claudeWebappChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.claudeWebappChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.claudeWebappChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.claudeWebappChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.claudeWebappChat.clearFiles()
  }
}
export { ClaudeChatProvider }
