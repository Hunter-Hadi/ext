import { CHAT_GPT_PROVIDER } from '@/constants'
import Browser from 'webextension-polyfill'
import {
  IChatUploadFile,
  IUserChatMessageExtraType,
} from '@/features/chatgpt/types'

/**
 * needAuth: 需要授权
 * loading: 正在加载
 * complete: 加载完成
 * success: 授权成功
 */
export type ChatStatus =
  | 'needAuth'
  | 'loading'
  | 'complete'
  | 'success'
  | 'needReload'

export type IAskChatGPTQuestionType = {
  messageId: string
  parentMessageId: string
  conversationId: string
  question: string
}
export type IAskChatGPTAnswerType = {
  messageId: string
  parentMessageId: string
  conversationId: string
  text: string
}

export type IChatGPTProviderType =
  (typeof CHAT_GPT_PROVIDER)[keyof typeof CHAT_GPT_PROVIDER]

export type IChatGPTAskQuestionFunctionType = (
  taskId: string,
  sender: Browser.Runtime.MessageSender,
  question: IAskChatGPTQuestionType,
  options: IUserChatMessageExtraType,
) => Promise<void>

export interface ChatSystemInterface {
  chatFiles: IChatUploadFile[]
  status: ChatStatus
  preAuth: () => Promise<void>
  auth: (authTabId: number) => Promise<void>
  destroy: () => Promise<void>
  createConversation: () => Promise<string>
  removeConversation: (conversationId: string) => Promise<boolean>
  sendQuestion: IChatGPTAskQuestionFunctionType
  abortAskQuestion: (messageId: string) => Promise<boolean>
  // 上传文件
  getFiles: () => Promise<IChatUploadFile[]>
  uploadFile: (file: IChatUploadFile) => Promise<void>
  abortUploadFile: (fileId: string) => Promise<boolean>
  removeFile: (fileId: string) => Promise<boolean>
  clearFiles: () => Promise<boolean>
}

export interface ChatAdapterInterface {
  chatFiles: IChatUploadFile[]
  status: ChatStatus
  preAuth: () => Promise<void>
  auth: (authTabId: number) => Promise<void>
  destroy: () => Promise<void>
  createConversation: () => Promise<string>
  removeConversation: (conversationId: string) => Promise<boolean>
  sendQuestion: IChatGPTAskQuestionFunctionType
  abortAskQuestion: (messageId: string) => Promise<boolean>
  // 上传文件
  getFiles: () => Promise<IChatUploadFile[]>
  uploadFile: (file: IChatUploadFile) => Promise<void>
  abortUploadFile: (fileId: string) => Promise<boolean>
  removeFile: (fileId: string) => Promise<boolean>
  clearFiles: () => Promise<boolean>
}

export class ChatAdapter implements ChatSystemInterface {
  private chatAdapter: ChatAdapterInterface
  constructor(chatAdapter: ChatAdapterInterface) {
    this.chatAdapter = chatAdapter
  }
  async preAuth() {
    await this.chatAdapter.preAuth()
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
    options,
  ) => {
    return this.chatAdapter.sendQuestion(taskId, sender, question, options)
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
  get chatFiles() {
    return this.chatAdapter.chatFiles
  }
  async uploadFile(file: IChatUploadFile) {
    return await this.chatAdapter.uploadFile(file)
  }
  async abortUploadFile(fileId: string) {
    return await this.chatAdapter.abortUploadFile(fileId)
  }
  async removeFile(fileId: string) {
    return await this.chatAdapter.removeFile(fileId)
  }
  async getFiles() {
    return await this.chatAdapter.getFiles()
  }
  async clearFiles() {
    return await this.chatAdapter.clearFiles()
  }
}
