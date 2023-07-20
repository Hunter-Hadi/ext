import { ClaudeAttachment, ClaudeConversation } from './types'
import {
  createClaudeConversation,
  deleteClaudeConversation,
  getCaludeOrganizationId,
  uploadClaudeAttachment,
} from './api'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { v4 as uuidV4 } from 'uuid'
import cloneDeep from 'lodash-es/cloneDeep'

export class Claude {
  private conversation: ClaudeConversation | undefined
  private abortController?: AbortController
  organizationId?: string
  attachments: ClaudeAttachment[] = []
  get conversationId() {
    return this.conversation?.uuid
  }
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
        attchments: this.attachments.map((attachment) => {
          const originalAttachment = cloneDeep(attachment)
          delete originalAttachment.id
          return originalAttachment
        }),
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
    this.resetAttachments()
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
  async uploadAttachment(file: File) {
    if (!this.organizationId) {
      this.organizationId = await getCaludeOrganizationId()
      if (!this.organizationId) {
        return {
          success: false,
          error: 'organization id not found',
          data: undefined,
        }
      }
    }
    // max file size 10MB
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: 'file size too large',
        data: undefined,
      }
    }
    const attachment = await uploadClaudeAttachment(this.organizationId, file)
    if (attachment) {
      attachment.id = uuidV4()
      this.attachments.push(attachment)
      return {
        success: true,
        error: undefined,
        data: attachment,
      }
    } else {
      return {
        success: false,
        error: 'upload failed',
        data: undefined,
      }
    }
  }
  resetAttachments() {
    this.attachments = []
    return true
  }
  removeAttachment(attachmentId: string) {
    const index = this.attachments.findIndex(
      (attachment) => attachment.id === attachmentId,
    )
    if (index > -1) {
      this.attachments.splice(index, 1)
    }
    return true
  }
}
