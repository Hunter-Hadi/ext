import Log from '@/utils/Log'
import { ChatStatus } from '@/background/provider/chat'
import { backgroundSendAllClientMessage } from '@/background/utils'
import { IChatUploadFile } from '@/features/chatgpt/types'

class BaseChat {
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
  async uploadFile(file: IChatUploadFile) {
    file.uploadStatus = 'success'
    file.uploadProgress = 100
    this.chatFiles.push(file)
  }
  async abortUploadFile(fileId: string) {
    let isAbort = false
    this.chatFiles = this.chatFiles.filter((file) => {
      if (file.id === fileId) {
        isAbort = true
        return false
      }
      return true
    })
    return isAbort
  }
  async removeFile(fileId: string) {
    let isRemove = false
    this.chatFiles = this.chatFiles.filter((file) => {
      if (file.id === fileId) {
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
  async clearFiles() {
    this.chatFiles = []
    return true
  }
}
export default BaseChat
