import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { v4 as uuidV4 } from 'uuid'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { ClaudeChat } from '@/background/src/chat/ClaudeChat'
import { IChatConversation } from '@/background/src/chatConversations'

class ClaudeChatProvider implements ChatAdapterInterface {
  private claudeChat: ClaudeChat

  constructor(claudeChat: ClaudeChat) {
    this.claudeChat = claudeChat
  }
  async auth(authTabId: number) {
    await this.claudeChat.auth()
  }
  async preAuth() {
    await this.claudeChat.preAuth()
  }
  get status() {
    return this.claudeChat.status
  }
  get conversation() {
    return this.claudeChat.conversation
  }
  async createConversation(initConversationData: Partial<IChatConversation>) {
    if (
      initConversationData?.id &&
      this.claudeChat.conversation?.id &&
      initConversationData.id !== this.claudeChat.conversation.id
    ) {
      console.log('新版Conversation 因为conversation id变了, 移除conversation')
      await this.claudeChat.removeConversation()
    }
    return await this.claudeChat.createConversation(initConversationData)
  }
  async removeConversation() {
    await this.claudeChat.removeConversationWithCache()
    await this.claudeChat.removeConversation()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    const messageId = uuidV4()
    await this.claudeChat.askChatGPT(
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
    return await this.claudeChat.abortTask(messageId)
  }
  async destroy() {
    await this.claudeChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.claudeChat.chatFiles
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.claudeChat.updateFiles(files)
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.claudeChat.uploadFiles(files)
  }
  async getUploadFileToken() {
    return await this.claudeChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.claudeChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.claudeChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.claudeChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.claudeChat.clearFiles()
  }
}
export { ClaudeChatProvider }
