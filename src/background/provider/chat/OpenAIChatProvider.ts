import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { OpenAIChat } from '@/background/src/chat'
import { IChatConversation } from '@/background/src/chatConversations'
import { IChatUploadFile } from '@/features/chatgpt/types'

class OpenAIChatProvider implements ChatAdapterInterface {
  private openAIChat: OpenAIChat
  constructor(openAIChat: OpenAIChat) {
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
  get conversation() {
    return this.openAIChat.conversation
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = (
    taskId,
    sender,
    question,
    options,
  ) => {
    return this.openAIChat.sendQuestion(taskId, sender, question, options)
  }
  async abortAskQuestion(messageId: string) {
    return await this.openAIChat.abortAskQuestion(messageId)
  }

  async createConversation(initConversationData: Partial<IChatConversation>) {
    if (
      initConversationData?.id &&
      this.openAIChat.conversation?.id &&
      initConversationData.id !== this.openAIChat.conversation.id
    ) {
      console.log('新版Conversation 因为conversation id变了, 移除conversation')
      await this.openAIChat.removeConversation(this.openAIChat.conversation.id)
    }
    return await this.openAIChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    return await this.openAIChat.removeConversation(conversationId)
  }
  destroy() {
    return this.openAIChat.destroy()
  }
  get chatFiles() {
    return this.openAIChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.openAIChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.openAIChat.updateFiles(files)
  }
  async removeFiles(fileIds: string[]) {
    return await this.openAIChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.openAIChat.getFiles()
  }
  async getUploadFileToken() {
    return await this.openAIChat.getUploadFileToken()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.openAIChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.openAIChat.clearFiles()
  }
}
export { OpenAIChatProvider }
