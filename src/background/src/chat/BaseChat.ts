import { ConversationStatusType } from '@/background/provider/chat'
import ConversationManager from '@/background/src/chatConversations'
import { backgroundSendAllClientMessage } from '@/background/utils'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'
import Log from '@/utils/Log'

class BaseChat {
  conversation: IConversation | undefined
  chatFiles: IChatUploadFile[]
  log: Log
  status: ConversationStatusType = 'needAuth'
  active = false
  taskList: {
    [key in string]: any
  } = {}
  constructor(name: string) {
    this.chatFiles = []
    this.log = new Log('Background/Chat/' + name)
  }
  async auth(tabId: number) {
    this.active = true
    await this.updateStatus('success')
  }
  async destroy() {
    await this.updateStatus('needAuth')
    this.active = false
  }
  async createConversation(newConversation?: Partial<IConversation>) {
    this.conversation = await ConversationManager.createConversation({
      ...newConversation,
    })
    return this.conversation.id
  }
  async removeConversationWithCache() {
    if (this.conversation?.id) {
      if (this.conversation.type === 'Summary') {
        console.log(
          '新版Conversation',
          '移除conversation',
          this.conversation.id,
          '因为是Summary',
        )
        await ConversationManager.removeConversation(this.conversation.id)
      } else if (this.conversation.type === 'Chat') {
        console.log(
          '新版Conversation',
          '移除conversation',
          this.conversation.id,
        )
      }
    }
    this.conversation = undefined
  }
  async updateStatus(status: ConversationStatusType) {
    if (this.active) {
      this.status = status
      this.log.info('updateStatus', this.status)
    }
    await this.updateClientConversationChatStatus()
  }
  async abortTask(taskId: string) {
    if (this.taskList[taskId]) {
      this.taskList[taskId]()
      delete this.taskList[taskId]
      return true
    }
    return true
  }
  async uploadFiles(files: IChatUploadFile[]) {
    files.map((file) => {
      this.chatFiles.push(file)
    })
  }
  async abortUploadFiles(fileIds: string[]) {
    let isAbort = false
    this.chatFiles = this.chatFiles.filter((file) => {
      if (fileIds.includes(file.id)) {
        isAbort = true
        return false
      }
      return true
    })
    return isAbort
  }
  async removeFiles(fileIds: string[]) {
    let isRemove = false
    this.chatFiles = this.chatFiles.filter((file) => {
      if (fileIds.includes(file.id)) {
        isRemove = true
        return false
      }
      return true
    })
    return isRemove
  }
  async getFiles() {
    return this.chatFiles
  }
  async updateFiles(updateFiles: IChatUploadFile[]) {
    this.chatFiles = this.chatFiles.map((file) => {
      const updateFile = updateFiles.find(
        (updateFile) => updateFile.id === file.id,
      )
      if (updateFile) {
        return updateFile
      }
      return file
    })
  }
  async clearFiles() {
    this.chatFiles = []
    return true
  }
  async getUploadFileToken() {
    return null as any
  }
  async updateClientConversationChatStatus() {
    if (this.active && this.conversation?.id) {
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
        conversationId: this.conversation.id,
      })
    }
  }
}
export default BaseChat
