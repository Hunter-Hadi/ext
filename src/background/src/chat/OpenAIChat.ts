import Browser from 'webextension-polyfill'
import {
  checkChatGPTProxyInstance,
  createDaemonProcessTab,
} from '@/background/src/chat/util'
import Log from '@/utils/Log'
import { ChatStatus } from '@/background/provider/chat'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import {
  backgroundSendAllClientMessage,
  createBackgroundMessageListener,
  getChromeExtensionSettings,
} from '@/background/utils'
import { IOpenAIChatListenTaskEvent } from '@/background/eventType'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'

const log = new Log('ChatGPT/OpenAIChat')

class OpenAIChat {
  status: ChatStatus = 'needAuth'
  private active = false
  private chatGPTProxyInstance?: Browser.Tabs.Tab
  private lastActiveTabId?: number
  private isAnswering = false
  private questionSender?: Browser.Runtime.MessageSender
  constructor() {
    this.init()
  }
  private init() {
    createBackgroundMessageListener(async (runtime, event, data, sender) => {
      if (runtime === 'daemon_process' && this.active) {
        switch (event) {
          case 'OpenAIDaemonProcess_daemonProcessExist': {
            let isExist =
              (this.chatGPTProxyInstance &&
                (await checkChatGPTProxyInstance(this.chatGPTProxyInstance))) ||
              false
            if (isExist && sender.tab?.id) {
              // 如果是同一个tab，不算存在
              isExist = !(sender.tab.id === this.chatGPTProxyInstance?.id)
              log.info(
                'OpenAIDaemonProcess_daemonProcessExist',
                '是否同一个tab',
                sender.tab.id === this.chatGPTProxyInstance?.id,
              )
            }
            log.info('OpenAIDaemonProcess_daemonProcessExist', isExist)
            return {
              success: true,
              message: '',
              data: {
                isExist,
              },
            }
          }
          case 'OpenAIDaemonProcess_setDaemonProcess':
            {
              log.info('OpenAIDaemonProcess_setDaemonProcess')
              this.chatGPTProxyInstance = sender.tab
              this.status = 'success'
              await this.updateClientStatus()
              if (this.lastActiveTabId && this.lastActiveTabId > 0) {
                // active
                await Browser.tabs.update(this.lastActiveTabId, {
                  active: true,
                })
                this.lastActiveTabId = undefined
              }
              return {
                success: true,
                message: '',
                data: {},
              }
            }
            break
          case 'OpenAIDaemonProcess_taskResponse':
            {
              log.info('OpenAIDaemonProcess_taskResponse', data)
              const { taskId, data: answer, done, error } = data
              if (this.questionSender && data) {
                const { tab } = this.questionSender
                if (tab && tab.id) {
                  await Browser.tabs.sendMessage(tab.id, {
                    id: CHROME_EXTENSION_POST_MESSAGE_ID,
                    event: 'Client_askChatGPTQuestionResponse',
                    data: {
                      taskId,
                      data: answer,
                      done,
                      error,
                    },
                  })
                }
              }
            }
            break
          case 'OpenAIDaemonProcess_pong':
            {
              log.info('DaemonProcess_pong')
              return {
                success: true,
                message: '',
                data: {},
              }
            }
            break
          default:
            break
        }
      }
      return undefined
    })
  }
  async auth(authTabId: number) {
    this.lastActiveTabId = authTabId
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
  async createConversation() {
    const cache = await getChromeExtensionSettings()
    const result = await this.sendDaemonProcessTask(
      'OpenAIDaemonProcess_createConversation',
      {
        conversationId: cache.conversationId || '',
        model: cache.currentModel || '',
      },
    )
    log.info('createConversation', result)
    if (result.success) {
      return result.data.conversationId
    }
    return ''
  }
  async removeConversation(conversationId: string) {
    log.info('removeConversation', conversationId)
    const result = await this.sendDaemonProcessTask(
      'OpenAIDaemonProcess_removeConversation',
      {
        conversationId,
      },
    )
    return result.success
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    if (!this.isAnswering) {
      this.questionSender = sender
      await this.sendDaemonProcessTask(
        'OpenAIDaemonProcess_askChatGPTQuestion',
        {
          taskId,
          question,
          options,
        },
      )
    }
  }
  async abortAskQuestion(messageId: string) {
    const result = await this.sendDaemonProcessTask(
      'OpenAIDaemonProcess_abortAskChatGPTQuestion',
      {
        messageId,
      },
    )
    return result.success
  }
  async destroy() {
    log.info('destroy')
    this.status = 'needAuth'
    if (this.chatGPTProxyInstance && this.chatGPTProxyInstance.id) {
      await Browser.tabs.remove(this.chatGPTProxyInstance.id)
    }
    this.chatGPTProxyInstance = undefined
    // await this.updateClientStatus()
    this.active = false
    this.removeListener()
  }
  async sendDaemonProcessTask(event: IOpenAIChatListenTaskEvent, data: any) {
    if (this.chatGPTProxyInstance) {
      if (
        (await checkChatGPTProxyInstance(this.chatGPTProxyInstance)) &&
        this.chatGPTProxyInstance.id
      ) {
        const result = await Browser.tabs.sendMessage(
          this.chatGPTProxyInstance.id,
          {
            id: CHROME_EXTENSION_POST_MESSAGE_ID,
            event,
            data,
          },
        )
        log.info('sendDaemonProcessTask', result)
        return result
      }
    }
    // 不存在守护进程，重新创建
    // TODO: 重新创建守护进程
    await this.destroy()
    return {
      success: false,
      data: {},
      message: 'daemon process not exist',
    }
  }
  async updateClientStatus() {
    if (this.active) {
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
      })
    }
  }
  // 守护进程定时发送心跳
  async keepAlive(): Promise<void> {
    if (this.chatGPTProxyInstance) {
      if (
        (await checkChatGPTProxyInstance(this.chatGPTProxyInstance)) &&
        this.chatGPTProxyInstance.id
      ) {
        log.info('keepAliveDaemonProcess')
        Browser.tabs.sendMessage(this.chatGPTProxyInstance.id, {
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'OpenAIDaemonProcess_ping',
        })
      }
    }
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))
    await delay(20 * 1000)
    await this.keepAlive()
  }
  async tabRemoveListener(tabId: number) {
    if (
      this.chatGPTProxyInstance?.id &&
      tabId === this.chatGPTProxyInstance.id
    ) {
      log.info('守护进程关闭')
      this.chatGPTProxyInstance = undefined
      this.status = 'needAuth'
      await this.updateClientStatus()
    }
  }
  async tabUpdateListener(
    tabId: number,
    changeInfo: Browser.Tabs.OnUpdatedChangeInfoType,
  ) {
    if (tabId === this.chatGPTProxyInstance?.id) {
      const isNotOpenAI = !changeInfo.url?.includes('https://chat.openai.com')
      const isUrlInOpenAIAuth = changeInfo.url?.includes(
        'https://chat.openai.com/auth',
      )
      if (changeInfo.url && (isNotOpenAI || isUrlInOpenAIAuth)) {
        log.info('守护进程url发生变化，守护进程关闭')
        this.chatGPTProxyInstance = undefined
        this.status = 'needAuth'
        await this.updateClientStatus()
      }
      if (changeInfo.status === 'loading' || changeInfo.status === 'complete') {
        log.info('守护进程url状态更新', changeInfo.status)
        this.status = changeInfo.status
        console.log('怎么回事')
        await this.updateClientStatus()
        await this.pingAwaitSuccess()
      }
    }
  }
  async pingAwaitSuccess() {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))
    if (this.chatGPTProxyInstance?.id && this.active) {
      log.info('start ping await success')
      let isOk = false
      for (let i = 0; i < 20; i++) {
        if (isOk) {
          break
        }
        console.log('怎么回事2', i)
        Browser.tabs
          .sendMessage(this.chatGPTProxyInstance.id, {
            id: CHROME_EXTENSION_POST_MESSAGE_ID,
            event: 'OpenAIDaemonProcess_ping',
          })
          .then((result) => {
            if (result.success) {
              log.info('ping await success')
              this.status = 'success'
              this.updateClientStatus()
              isOk = true
              console.log('怎么回事3', i)
            }
          })
        await delay(1000)
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
