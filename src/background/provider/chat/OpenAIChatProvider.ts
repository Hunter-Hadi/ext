import { OpenAIChat } from '@/background/src/chatGPT'
import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'

class OpenAIChatProvider implements ChatAdapterInterface {
  private openAIChat: OpenAIChat
  constructor(openAIChat: OpenAIChat) {
    this.openAIChat = openAIChat
  }
  async preAuth() {
    return Promise.resolve()
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
}
export { OpenAIChatProvider }
