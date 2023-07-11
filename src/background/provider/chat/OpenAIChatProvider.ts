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
  async uploadFile(file: IChatUploadFile) {
    return await this.openAIChat.uploadFile(file)
  }
  async removeFile(fileId: string) {
    return await this.openAIChat.removeFile(fileId)
  }
  async getFiles() {
    return await this.openAIChat.getFiles()
  }
  async abortUploadFile(fileId: string) {
    return await this.openAIChat.abortUploadFile(fileId)
  }
  async clearFiles() {
    return await this.openAIChat.clearFiles()
  }
}
export { OpenAIChatProvider }
