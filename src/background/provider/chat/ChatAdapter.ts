import Browser from 'webextension-polyfill'

import { IChatConversation } from '@/background/src/chatConversations'
import { AI_PROVIDER_MAP } from '@/constants'
import { IChatUploadFile, IUserChatMessage } from '@/features/chatgpt/types'

/**
 * needAuth: 需要授权
 * loading: 正在加载
 * complete: 加载完成
 * success: 授权成功
 */
export type ConversationStatusType =
  | 'needAuth'
  | 'loading'
  | 'complete'
  | 'success'
  | 'needReload'

export type IAIProviderType =
  (typeof AI_PROVIDER_MAP)[keyof typeof AI_PROVIDER_MAP]

export type IChatGPTAskQuestionFunctionType = (
  taskId: string,
  sender: Browser.Runtime.MessageSender,
  question: IUserChatMessage,
) => Promise<void>

export interface ChatSystemInterface {
  conversation?: IChatConversation
  chatFiles: IChatUploadFile[]
  status: ConversationStatusType
  preAuth: () => Promise<void>
  auth: (authTabId: number) => Promise<void>
  destroy: () => Promise<void>
  createConversation: (
    initConversationData: Partial<IChatConversation>,
  ) => Promise<string>
  removeConversation: (conversationId: string) => Promise<boolean>
  sendQuestion: IChatGPTAskQuestionFunctionType
  abortAskQuestion: (messageId: string) => Promise<boolean>
  // 上传文件
  getFiles: () => Promise<IChatUploadFile[]>
  getUploadFileToken: () => Promise<any>
  updateFiles: (updateFiles: IChatUploadFile[]) => Promise<void>
  uploadFiles: (file: IChatUploadFile[]) => Promise<void>
  abortUploadFiles: (fileIds: string[]) => Promise<boolean>
  removeFiles: (fileIds: string[]) => Promise<boolean>
  clearFiles: () => Promise<boolean>
}

export interface ChatAdapterInterface {
  conversation?: IChatConversation
  chatFiles: IChatUploadFile[]
  status: ConversationStatusType
  preAuth: () => Promise<void>
  auth: (authTabId: number) => Promise<void>
  destroy: () => Promise<void>
  createConversation: (
    initConversationData: Partial<IChatConversation>,
  ) => Promise<string>
  removeConversation: (conversationId: string) => Promise<boolean>
  sendQuestion: IChatGPTAskQuestionFunctionType
  abortAskQuestion: (messageId: string) => Promise<boolean>
  // 上传文件
  getFiles: () => Promise<IChatUploadFile[]>
  getUploadFileToken: () => Promise<any>
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
  get conversation() {
    return this.chatAdapter.conversation
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
  async createConversation(initConversationData: Partial<IChatConversation>) {
    return await this.chatAdapter.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    return await this.chatAdapter.removeConversation(conversationId)
  }
  get chatFiles() {
    return this.chatAdapter.chatFiles
  }
  async getUploadFileToken() {
    return await this.chatAdapter.getUploadFileToken()
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
