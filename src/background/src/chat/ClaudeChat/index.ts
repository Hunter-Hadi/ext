import BaseChat from '@/background/src/chat/BaseChat'
import { Claude } from '@/background/src/chat/ClaudeChat/claude'
import Browser from 'webextension-polyfill'
import {
  getClaudeOrganizationId,
  removeAllCacheClaudeConversation,
} from '@/background/src/chat/ClaudeChat/claude/api'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { deserializeUploadFile } from '@/background/utils/uplpadFileProcessHelper'
import { v4 as uuidV4 } from 'uuid'
import { ClaudeAttachment } from '@/background/src/chat/ClaudeChat/claude/types'
import ChatConversations from '@/background/src/chatConversations'

// 为了减少请求claude.ai网页，设置一个本地的token key
const cacheTokenKey = 'CHROME_EXTENSION_LOCAL_STORAGE_CLAUDE_TOKEN_KEY'
const CLAUDE_CONVERSATION_NAME = 'MaxAI.me'
class ClaudeChat extends BaseChat {
  private claude: Claude
  constructor() {
    super('ClaudeChat')
    this.claude = new Claude()
    this.status = 'needAuth'
  }
  async init() {
    this.log.info('init')
  }
  async preAuth() {
    this.active = true
    const cache = await Browser.storage.local.get(cacheTokenKey)
    if (cache[cacheTokenKey]) {
      this.claude.organizationId = cache[cacheTokenKey]
    }
    this.status = this.claude.organizationId ? 'success' : 'needAuth'
    await this.updateClientStatus(this.status)
  }
  async auth() {
    this.active = true
    // 获取organizationId, 如果没有则打开claude.ai网页
    this.claude.organizationId = await getClaudeOrganizationId()
    if (this.claude.organizationId) {
      this.status = 'success'
      // update cache
      await Browser.storage.local.set({
        [cacheTokenKey]: this.claude.organizationId,
      })
      await this.updateClientStatus('success')
    } else {
      // 打开claude.ai网页
      await Browser.tabs.create({
        url: 'https://claude.ai/chats',
        active: true,
      })
    }
  }
  async createConversation() {
    if (!this.conversation) {
      await super.createConversation()
    }
    if (this.conversation?.meta.AIConversationId) {
      return this.conversation.id
    }
    const conversationId = await this.claude.createConversation(
      CLAUDE_CONVERSATION_NAME,
    )
    // 创建会话的时候有可能失败，触发更新organizationId，所以可以在这里更新缓存
    if (this.claude.organizationId) {
      // update cache
      await Browser.storage.local.set({
        [cacheTokenKey]: this.claude.organizationId,
      })
    } else {
      // 如果创建失败说明token过期了，需要重新登录
      // 清空缓存
      await Browser.storage.local.remove(cacheTokenKey)
      // 重新登录
      this.status = 'needAuth'
      await this.updateClientStatus('needAuth')
    }
    if (this.conversation) {
      this.conversation.meta.AIConversationId = conversationId
      await ChatConversations.conversationDB.addOrUpdateConversation(
        this.conversation,
      )
    }
    return this.conversation?.id || ''
  }
  async askChatGPT(
    question: string,
    options?: {
      taskId: string
      include_history?: boolean
      regenerate?: boolean
      streaming?: boolean
      max_history_message_cnt?: number
    },
    onMessage?: (message: {
      type: 'error' | 'message'
      done: boolean
      error: string
      data: {
        text: string
        conversationId: string
      }
    }) => void,
  ) {
    const { regenerate } = options || {}
    let partOfMessageText = ''
    this.log.info('ClaudeChat send')
    await this.claude.sendMessage(question, {
      regenerate: regenerate,
      onMessage: (claudeMessage) => {
        if (!claudeMessage.stop) {
          // 有可能会有多个message
          partOfMessageText += claudeMessage.completion || ''
          onMessage?.({
            type: 'message',
            done: false,
            error: '',
            data: {
              text: partOfMessageText,
              conversationId: this.claude.conversationId!,
            },
          })
        } else {
          if (claudeMessage.stop_reason === 'stop_sequence') {
            onMessage?.({
              type: 'message',
              done: true,
              error: '',
              data: {
                text: partOfMessageText,
                conversationId: this.claude.conversationId!,
              },
            })
          } else if (
            claudeMessage.stop_reason === 'The user aborted a request.'
          ) {
            onMessage?.({
              type: 'error',
              error: 'manual aborted request.',
              done: true,
              data: { text: '', conversationId: this.claude.conversationId! },
            })
          } else {
            onMessage?.({
              type: 'error',
              done: true,
              error: claudeMessage.stop_reason || 'Network Error',
              data: {
                text: partOfMessageText,
                conversationId: this.claude.conversationId!,
              },
            })
          }
        }
      },
    })
    await this.clearFiles()
  }
  async abortTask(taskId: string) {
    this.claude.abortSendMessage()
    return true
  }
  async removeConversation(conversationId: string) {
    this.conversation = undefined
    await this.claude.resetConversation()
    if (this.claude.organizationId) {
      // 异步删除会话
      removeAllCacheClaudeConversation(
        this.claude.organizationId,
        CLAUDE_CONVERSATION_NAME,
      )
        .then()
        .catch()
    }
    return
  }
  async getUploadFileToken() {
    if (!this.claude.organizationId) {
      await this.auth()
    }
    return this.claude.organizationId
  }
  async uploadFiles(files: IChatUploadFile[]) {
    this.chatFiles = files
    this.chatFiles = await Promise.all(
      files.map(async (file) => {
        if (file.uploadStatus !== 'success') {
          const [fileUnit8Array, type] = deserializeUploadFile(file.file as any)
          const blob = new Blob([fileUnit8Array], { type })
          if (type.includes('pdf')) {
            const attachmentResult = await this.claude.uploadAttachment(
              blob,
              file.fileName,
            )
            if (attachmentResult.success && attachmentResult.data) {
              return {
                ...file,
                id: attachmentResult.data.id,
                file: undefined, // 释放内存
                uploadStatus: 'success',
                uploadProgress: 100,
              } as IChatUploadFile
            } else {
              return {
                ...file,
                file: undefined, // 释放内存
                uploadStatus: 'error',
                uploadProgress: 0,
                uploadErrorMessage: attachmentResult.error,
              } as IChatUploadFile
            }
          } else {
            // 其他文件类型直接读取文本
            const text = await blob.text()
            const textAttachments = {
              id: uuidV4(),
              extracted_content: text,
              file_name: file.fileName,
              file_size: file.fileSize,
              file_type: type,
              totalPages: 1,
            } as ClaudeAttachment
            this.claude.attachments.push(textAttachments)
            return {
              ...file,
              id: textAttachments.id,
              file: undefined, // 释放内存
              uploadStatus: 'success',
              uploadProgress: 100,
            } as IChatUploadFile
          }
        }
        return file
      }),
    )
  }
  async removeFiles(fileIds: string[]) {
    await super.removeFiles(fileIds)
    fileIds.forEach((fileId) => {
      this.claude.removeAttachment(fileId)
    })
    return true
  }
  async destroy() {
    await this.clearFiles()
    this.claude.resetAttachments()
    this.status = 'needAuth'
    await this.updateClientStatus('needAuth')
    this.active = false
  }
}

export { ClaudeChat }
