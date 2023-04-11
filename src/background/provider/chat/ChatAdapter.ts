import { CHAT_GPT_PROVIDER } from '@/types'
import Browser from 'webextension-polyfill'

/**
 * switchProvider: 切换服务商
 * needAuth: 需要授权
 * loading: 正在加载
 * complete: 加载完成
 * success: 授权成功
 */
export type ChatStatus =
  | 'switchProvider'
  | 'needAuth'
  | 'loading'
  | 'complete'
  | 'success'

export type IChatGPTProviderType =
  (typeof CHAT_GPT_PROVIDER)[keyof typeof CHAT_GPT_PROVIDER]

export type IChatGPTAskQuestionFunctionType = (
  taskId: string,
  sender: Browser.Runtime.MessageSender,
  question: {
    messageId: string
    parentMessageId: string
    conversationId: string
    question: string
  },
) => Promise<void>

export interface ChatInterface {
  status: ChatStatus
  auth: (authTabId: number) => Promise<void>
  destroy: () => Promise<void>
  createConversation: () => Promise<string>
  removeConversation: (conversationId: string) => Promise<boolean>
  sendQuestion: IChatGPTAskQuestionFunctionType
  abortAskQuestion: (messageId: string) => Promise<boolean>
}

export interface ChatAdapterInterface {
  status: ChatStatus
  auth: (authTabId: number) => Promise<void>
  destroy: () => Promise<void>
  createConversation: () => Promise<string>
  removeConversation: (conversationId: string) => Promise<boolean>
  sendQuestion: IChatGPTAskQuestionFunctionType
  abortAskQuestion: (messageId: string) => Promise<boolean>
}

export class ChatAdapter implements ChatInterface {
  private chatAdapter: ChatAdapterInterface
  constructor(chatAdapter: ChatAdapterInterface) {
    this.chatAdapter = chatAdapter
  }
  async auth(authTabId: number) {
    await this.chatAdapter.auth(authTabId)
  }
  get status() {
    return this.chatAdapter.status
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = (
    taskId,
    sender,
    question,
  ) => {
    return this.chatAdapter.sendQuestion(taskId, sender, question)
  }
  async abortAskQuestion(messageId: string) {
    return await this.chatAdapter.abortAskQuestion(messageId)
  }
  async destroy() {
    await this.chatAdapter.destroy()
  }
  async createConversation() {
    return await this.chatAdapter.createConversation()
  }
  async removeConversation(conversationId: string) {
    return await this.chatAdapter.removeConversation(conversationId)
  }
}
