import { ChatStatus } from '@/background/provider/chat'
import ConversationManager, {
  IChatConversation,
} from '@/background/src/chatConversations'
import { backgroundSendAllClientMessage } from '@/background/utils'
import { IChatUploadFile } from '@/features/chatgpt/types'
import Log from '@/utils/Log'

class BaseChat {
  conversation: IChatConversation | undefined
  chatFiles: IChatUploadFile[]
  log: Log
  status: ChatStatus = 'needAuth'
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
    await this.updateClientStatus('success')
  }
  async destroy() {
    await this.updateClientStatus('needAuth')
    this.active = false
  }
  async createConversation(newConversation?: Partial<IChatConversation>) {
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
  async updateClientStatus(status: ChatStatus) {
    if (this.active) {
      if (status === 'needAuth') {
        debugger
      }
      this.status = status
      this.log.info('updateStatus', this.status)
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
      })
    }
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
      file.uploadStatus = 'success'
      file.uploadProgress = 100
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
}
export default BaseChat
