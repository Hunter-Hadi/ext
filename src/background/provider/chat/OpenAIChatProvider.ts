import { OpenAIChat } from '@/background/src/chat'
import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { IChatUploadFile } from '@/features/chatgpt/types'

class OpenAIChatProvider implements ChatAdapterInterface {
  private openAIChat: OpenAIChat
  constructor(openAIChat: OpenAIChat) {
    this.openAIChat = openAIChat
  }
  async preAuth() {
    return this.openAIChat.preAuth()
  }
  auth(authTabId: number) {
    return this.openAIChat.auth(authTabId)
  }
  get status() {
    return this.openAIChat.status
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

  async createConversation() {
    return await this.openAIChat.createConversation()
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
  async abortUploadFiles(fileIds: string[]) {
    return await this.openAIChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.openAIChat.clearFiles()
  }
}
export { OpenAIChatProvider }
