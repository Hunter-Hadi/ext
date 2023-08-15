import Log from '@/utils/Log'
import { ChatStatus } from '@/background/provider/chat'
import { backgroundSendAllClientMessage } from '@/background/utils'
import { IChatUploadFile } from '@/features/chatgpt/types'
import ConversationManager, {
  ChatConversation,
} from '@/background/src/chatConversations'

class BaseChat {
  conversation: ChatConversation | undefined
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
  async createConversation(newConversation?: Partial<ChatConversation>) {
    this.conversation = await ConversationManager.createConversation({
      ...newConversation,
    })
    return this.conversation.id
  }
  async updateClientStatus(status: ChatStatus) {
    if (this.active) {
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
