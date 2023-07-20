import { ClaudeConversation } from './types'
import {
  createClaudeConversation,
  deleteClaudeConversation,
  getCaludeOrganizationId,
} from './api'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'

export class Claude {
  private organizationId?: string
  private conversation: ClaudeConversation | undefined
  private abortController?: AbortController
  async createConversation(name?: string) {
    if (!this.organizationId) {
      this.organizationId = await getCaludeOrganizationId()
    }
    if (this.organizationId) {
      this.conversation = await createClaudeConversation(
        this.organizationId,
        name,
      )
    }
    return this.conversation?.uuid || ''
  }
  async sendMessage(
    text: string,
    options?: {
      regenerate?: boolean
    },
  ) {
    const { regenerate = false } = options || {}
    let conversationId = this.conversation?.uuid
    if (!conversationId || !this.organizationId) {
      // 创建一个conversation
      conversationId = await this.createConversation()
      // 如果还是没有conversationId，那么就不发送了, 让用户重新登陆
      if (!conversationId || !this.organizationId) {
        return
      }
      return
    }
    this.abortController = new AbortController()
    const signal = this.abortController.signal
    const apiHost = regenerate
      ? 'https://claude.ai/api/retry_message'
      : 'https://claude.ai/api/append_message'
    await fetchSSE(apiHost, {
      signal,
      method: 'POST',
      provider: 'CLAUDE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attchments: [],
        completion: {
          incremental: true,
          model: 'claude-2',
          prompt: text,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        conversation_uuid: conversationId,
        organization_uuid: this.organizationId,
        text,
      }),
      onMessage: (message: string) => {
        console.debug('claude sse message', message)
        debugger
      },
    })
  }
  abortSendMessage() {
    this.abortController?.abort()
  }
  async resetConversation() {
    if (this.conversation?.uuid && this.organizationId) {
      await deleteClaudeConversation(
        this.organizationId,
        this.conversation.uuid,
      )
    }
    this.conversation = undefined
    return true
  }
}
