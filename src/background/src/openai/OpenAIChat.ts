import Browser from 'webextension-polyfill'
import {
  checkChatGPTProxyInstance,
  createDaemonProcessTab,
} from '@/background/src/openai/util'
import Log from '@/utils/Log'
import { ChatStatus } from '@/background/provider/chat'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import {
  backgroundSendAllClientMessage,
  createBackgroundMessageListener,
} from '@/background/utils'

const log = new Log('OpenAIChat')

class OpenAIChat {
  status: ChatStatus = 'needAuth'
  private active = false
  private chatGPTProxyInstance?: Browser.Tabs.Tab
  constructor() {
    this.init()
  }
  async auth() {
    this.active = true
    this.status = 'loading'
    await this.updateClientStatus()
    this.chatGPTProxyInstance = await createDaemonProcessTab()
    if (this.chatGPTProxyInstance) {
      this.status = 'complete'
      this.listenDaemonProcessTab()
      await this.updateClientStatus()
      await this.keepAlive()
    }
  }
  async destroy() {
    this.active = false
    this.status = 'needAuth'
    this.chatGPTProxyInstance = undefined
    this.removeListener()
  }
  createConversation(): void {
    log.info('createConversation')
  }
  sendMessage(question: string): Promise<void> {
    log.info('sendMessage')
    return Promise.resolve()
  }
  async updateClientStatus() {
    if (this.active) {
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
      })
    }
  }
  private init() {
    createBackgroundMessageListener(async (runtime, event, data, sender) => {
      if (runtime === 'daemon_process' && this.active) {
        switch (event) {
          case 'DaemonProcess_daemonProcessExist': {
            let isExist =
              (this.chatGPTProxyInstance &&
                (await checkChatGPTProxyInstance(this.chatGPTProxyInstance))) ||
              false
            if (isExist && sender.tab?.id) {
              // 如果是同一个tab，不算存在
              isExist = !(sender.tab.id === this.chatGPTProxyInstance?.id)
              log.info(
                'DaemonProcess_daemonProcessExist',
                '是否同一个tab',
                sender.tab.id === this.chatGPTProxyInstance?.id,
              )
            }
            log.info('DaemonProcess_daemonProcessExist', isExist)
            return {
              success: true,
              message: '',
              data: {
                isExist: isExist,
              },
            }
          }
          case 'DaemonProcess_initChatGPTProxyInstance':
            {
              log.info('DaemonProcess_initChatGPTProxyInstance')
              this.chatGPTProxyInstance = sender.tab
              this.status = 'success'
              await this.updateClientStatus()
              return {
                success: true,
                message: '',
                data: {},
              }
            }
            break
          case 'DaemonProcess_pong':
            {
              log.info('DaemonProcess_pong')
            }
            break
          default:
            break
        }
      }
      return undefined
    })
  }
  // 守护进程定时发送心跳
  async keepAlive(): Promise<void> {
    if (this.chatGPTProxyInstance) {
      if (
        (await checkChatGPTProxyInstance(this.chatGPTProxyInstance)) &&
        this.chatGPTProxyInstance.id
      ) {
        log.info('keepAliveDaemonProcess')
        await Browser.tabs.sendMessage(this.chatGPTProxyInstance.id, {
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'DaemonProcess_ping',
        })
      }
    }
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))
    await delay(20 * 1000)
    await this.keepAlive()
  }
  tabRemoveListener(tabId: number) {
    if (
      this.chatGPTProxyInstance?.id &&
      tabId === this.chatGPTProxyInstance.id
    ) {
      log.info('守护进程关闭')
      this.chatGPTProxyInstance = undefined
    }
  }
  tabUpdateListener(
    tabId: number,
    changeInfo: Browser.Tabs.OnUpdatedChangeInfoType,
  ) {
    if (tabId === this.chatGPTProxyInstance?.id) {
      if (
        changeInfo.url &&
        changeInfo.url.indexOf('https://chat.openai.com/chat') !== 0
      ) {
        log.info('守护进程url发生变化，守护进程关闭')
        this.chatGPTProxyInstance = undefined
        this.status = 'needAuth'
      }
      if (changeInfo.status === 'loading' || changeInfo.status === 'complete') {
        log.info('守护进程url状态更新', changeInfo.status)
        this.status = changeInfo.status
      }
    }
  }
  listenDaemonProcessTab() {
    Browser.tabs.onRemoved.addListener(this.tabRemoveListener.bind(this))
    Browser.tabs.onUpdated.addListener(this.tabUpdateListener.bind(this))
  }
  removeListener() {
    Browser.tabs.onRemoved.removeListener(this.tabRemoveListener.bind(this))
    Browser.tabs.onUpdated.removeListener(this.tabUpdateListener.bind(this))
  }
}

export { OpenAIChat }
