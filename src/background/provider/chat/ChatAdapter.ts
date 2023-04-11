import { CHAT_GPT_PROVIDER } from '@/types'

/**
 * needAuth: 需要授权
 * loading: 正在加载
 * complete: 加载完成
 * success: 授权成功
 */
export type ChatStatus = 'needAuth' | 'loading' | 'complete' | 'success'

export type IChatGPTProviderType =
  (typeof CHAT_GPT_PROVIDER)[keyof typeof CHAT_GPT_PROVIDER]

export interface ChatInterface {
  status: ChatStatus
  auth: () => Promise<void>
  destroy: () => Promise<void>
  sendQuestion: (question: string) => Promise<void>
}

export interface ChatAdapterInterface {
  status: ChatStatus
  auth: () => Promise<void>
  sendQuestion: (question: string) => Promise<void>
  destroy: () => Promise<void>
}

export class ChatAdapter implements ChatInterface {
  private chatAdapter: ChatAdapterInterface
  constructor(chatAdapter: ChatAdapterInterface) {
    this.chatAdapter = chatAdapter
  }
  async auth() {
    await this.chatAdapter.auth()
  }
  get status() {
    return this.chatAdapter.status
  }
  sendQuestion(question: string) {
    return this.chatAdapter.sendQuestion(question)
  }
  async destroy() {
    await this.chatAdapter.destroy()
  }
}
