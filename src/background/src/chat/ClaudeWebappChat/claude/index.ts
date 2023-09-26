import { ClaudeAttachment, ClaudeConversation, ClaudeMessage } from './types'
import {
  createClaudeConversation,
  deleteClaudeConversation,
  getClaudeOrganizationId,
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

  constructor(organizationId?: string) {
    this.organizationId = organizationId
  }
  get conversationId() {
    return this.conversation?.uuid
  }
  async createConversation(name?: string) {
    if (!this.organizationId) {
      this.organizationId = await getClaudeOrganizationId()
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
      onMessage?: (message: ClaudeMessage) => void
    },
  ) {
    const { regenerate = false, onMessage } = options || {}
    let conversationId = this.conversation?.uuid
    if (!conversationId || !this.organizationId) {
      // 创建一个conversation
      conversationId = await this.createConversation()
      // 如果还是没有conversationId，那么就不发送了, 让用户重新登陆
      if (!conversationId || !this.organizationId) {
        onMessage?.({
          completion: '',
          log_id: '',
          messageLimit: {
            type: 'within_limit',
          },
          model: '',
          stop: true,
          stop_reason:
            'Please log into [Claude.ai](https://claude.ai/chats) and try again.',
        } as ClaudeMessage)
        return
      }
      // return
    }
    this.abortController = new AbortController()
    const signal = this.abortController.signal
    const apiHost = regenerate
      ? 'https://claude.ai/api/retry_message'
      : 'https://claude.ai/api/append_message'
    // claude api 的设计是，如果是regenerate用户发送的消息必须是空的
    if (regenerate) {
      text = ''
    }
    await fetchSSE(apiHost, {
      signal,
      method: 'POST',
      provider: 'CLAUDE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attachments: this.attachments.map((attachment) => {
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
        try {
          const data = JSON.parse(message) as ClaudeMessage
          if (data.log_id) {
            onMessage?.(data)
          } else if (data?.error?.message) {
            let errorMessage = data?.error?.message || 'Network Error'
            // claude.ai 负荷过大的时候，会返回 Overloaded
            if (errorMessage === 'Overloaded') {
              errorMessage = `You've sent too many requests to the Claude model. You can continue with the other AI Providers now, or try again later.`
            }
            onMessage?.({
              completion: '',
              log_id: '',
              messageLimit: {
                type: 'within_limit',
              },
              model: '',
              stop: true,
              stop_reason: errorMessage,
            })
          }
        } catch (e) {
          console.error('claude sse message parse error', e)
        }
      },
    })
      .then(() => {
        // do nothing
      })
      .catch((err) => {
        if (
          err?.message === 'BodyStreamBuffer was aborted' ||
          err?.message === 'The user aborted a request.'
        ) {
          onMessage?.({
            completion: '',
            log_id: '',
            messageLimit: {
              type: 'within_limit',
            },
            model: '',
            stop: true,
            stop_reason: 'The user aborted a request.',
          } as ClaudeMessage)
          return
        }
        try {
          const errorData = JSON.parse(err.message)
          const errorMessage =
            errorData?.error?.message || errorData?.message || 'Network Error'
          onMessage?.({
            completion: '',
            log_id: '',
            messageLimit: {
              type: 'within_limit',
            },
            model: '',
            stop: true,
            stop_reason: errorMessage,
          })
        } catch (e) {
          onMessage?.({
            completion: '',
            log_id: '',
            messageLimit: {
              type: 'within_limit',
            },
            model: '',
            stop: true,
            stop_reason: 'Network Error',
          })
        }
      })
    this.resetAttachments()
  }
  abortSendMessage() {
    this.abortController?.abort()
  }
  async resetConversation() {
    if (this.conversation?.uuid && this.organizationId) {
      const result = await deleteClaudeConversation(
        this.organizationId,
        this.conversation.uuid,
      )
      console.log('deleteClaudeConversation', result)
    }
    this.conversation = undefined
    return true
  }
  async uploadAttachment(file: File | Blob, fileName?: string) {
    if (!this.organizationId) {
      this.organizationId = await getClaudeOrganizationId()
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
    const attachmentResult = await uploadClaudeAttachment(
      this.organizationId,
      file,
      fileName || (file as File).name,
    )
    if (attachmentResult.success && attachmentResult.data) {
      const attachment = attachmentResult.data
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
        error: attachmentResult.error || 'Upload failed.',
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
