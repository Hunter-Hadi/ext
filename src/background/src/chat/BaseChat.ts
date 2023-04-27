import Log from '@/utils/Log'
import { ChatStatus } from '@/background/provider/chat'
import { backgroundSendAllClientMessage } from '@/background/utils'

class BaseChat {
  log: Log
  status: ChatStatus = 'needAuth'
  active = false
  taskList: {
    [key in string]: any
  } = {}
  constructor(name: string) {
    this.log = new Log('Background/Chat/' + name)
  }
  async auth() {
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
}
export default BaseChat
