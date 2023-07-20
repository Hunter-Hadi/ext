import { AI_PROVIDER_MAP } from '@/constants'
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

export type IAIProviderType =
  (typeof AI_PROVIDER_MAP)[keyof typeof AI_PROVIDER_MAP]

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
  updateFiles: (updateFiles: IChatUploadFile[]) => Promise<void>
  uploadFiles: (file: IChatUploadFile[]) => Promise<void>
  abortUploadFiles: (fileIds: string[]) => Promise<boolean>
  removeFiles: (fileIds: string[]) => Promise<boolean>
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
  updateFiles: (updateFiles: IChatUploadFile[]) => Promise<void>
  uploadFiles: (file: IChatUploadFile[]) => Promise<void>
  abortUploadFiles: (fileIds: string[]) => Promise<boolean>
  removeFiles: (fileIds: string[]) => Promise<boolean>
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
  async updateFiles(updateFiles: IChatUploadFile[]) {
    await this.chatAdapter.updateFiles(updateFiles)
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.chatAdapter.uploadFiles(files)
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.chatAdapter.abortUploadFiles(fileIds)
  }
  async removeFiles(fileIds: string[]) {
    return await this.chatAdapter.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.chatAdapter.getFiles()
  }
  async clearFiles() {
    return await this.chatAdapter.clearFiles()
  }
}
