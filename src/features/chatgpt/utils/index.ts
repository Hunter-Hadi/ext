import {
  IOpenAIChatSendEvent,
  IChromeExtensionClientSendEvent,
} from '@/background/app'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { IChromeExtensionChatGPTDaemonProcessSendEvent } from '@/background.old'

export const pingDaemonProcess = async () => {
  const port = new ContentScriptConnectionV2()
  const result = await port.postMessage({
    event: 'Client_checkChatGPTStatus',
    data: {},
  })
  return result.success
}

export const pingUntilLogin = () => {
  const port = new ContentScriptConnectionV2()
  return new Promise<boolean>((resolve) => {
    console.log('start pingUntilLogin')
    let maxRetry = 120
    const delay = (t: number) =>
      new Promise((resolve) => setTimeout(resolve, t))
    const checkStatus = async () => {
      const result = await port.postMessage({
        event: 'Client_checkChatGPTStatus',
        data: {},
      })
      if (result.success) {
        if (result?.data?.status !== 'success') {
          maxRetry--
          if (maxRetry <= 0) {
            resolve(false)
          }
          await delay(1000)
          await checkStatus()
        } else {
          resolve(true)
        }
      }
    }
    checkStatus()
  })
}

type MessageCallback = (message: any) => void

export class ContentScriptConnection {
  private runtime: 'client' | 'daemon_process'
  private port: Browser.Runtime.Port
  private heartbeatTimer: any | null
  private heartbeatInterval = 1000
  private messageCallbacks: MessageCallback[]
  private retryCount: number
  constructor(
    options: {
      openHeartbeat?: boolean
      heartbeatInterval?: number
      runtime?: 'client' | 'daemon_process'
    } = {},
  ) {
    console.log('[ContentScriptConnection]: init')
    // 创建一个与扩展程序后台建立连接的端口对象
    this.port = Browser.runtime.connect()
    // 初始化心跳计时器
    this.heartbeatTimer = null
    // 初始化消息回调函数列表
    this.messageCallbacks = []
    // 监听端口的消息事件
    this.port.onMessage.addListener(this.handleMessage.bind(this))
    // 初始化重试次数
    this.retryCount = 0
    // 初始化运行环境
    this.runtime = options.runtime || 'client'
    // 初始化心跳间隔
    this.heartbeatInterval = options.heartbeatInterval || 1000
    // 是否开启心跳
    if (options.openHeartbeat) {
      this.startHeartbeat()
    }
  }
  postMessage(msg: {
    id: string
    event:
      | IChromeExtensionClientSendEvent
      | IChromeExtensionChatGPTDaemonProcessSendEvent
    data?: any
  }) {
    try {
      this.port.postMessage(msg)
      this.retryCount = 0
    } catch (e) {
      console.log('[ContentScriptConnection]: send error', e, '\ndata:\t', msg)
      if (this.retryCount < 10) {
        console.log('[ContentScriptConnection]: retry', this.retryCount)
        this.retryCount++
        this.port = Browser.runtime.connect()
        this.postMessage(msg)
      }
      return
    }
    if (!this.heartbeatTimer) {
      // TODO 先不发送心跳
      return
      this.startHeartbeat()
    }
  }
  // 注册一个消息回调函数
  onMessage(callback: MessageCallback) {
    this.messageCallbacks.push(callback)
  }
  // 处理从扩展程序后台接收到的消息
  private handleMessage(message: any) {
    // 如果接收到的消息是心跳消息，则忽略
    if (message.type === 'heartbeat') {
      return
    }
    // 调用所有注册的消息回调函数
    this.messageCallbacks.forEach((callback) => {
      callback(message)
    })
  }
  onDisconnect(callback: () => void) {
    this.port.onDisconnect.addListener(callback)
  }
  private startHeartbeat() {
    console.log('[ContentScriptConnection]: heartbeat start')
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.runtime === 'daemon_process') {
        console.log('[ContentScriptConnection]: heartbeat exec')
        this.postMessage({
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'DaemonProcess_Pong',
        })
      } else {
        if (document.hidden) {
          console.log(
            '[ContentScriptConnection]: heartbeat jump with document.hidden',
          )
          return
        }
        console.log('[ContentScriptConnection]: heartbeat exec')
        this.postMessage({
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'Client_Ping',
        })
        this.postMessage({
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'Client_checkChatGPTStatus',
        })
      }
    }, this.heartbeatInterval)
  }
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      console.log('[ContentScriptConnection]: heartbeat stop')
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
  destroy() {
    console.log('[ContentScriptConnection]: heartbeat destroy')
    this.stopHeartbeat()
    this.port.disconnect()
  }
}

export class ContentScriptConnectionV2 {
  private runtime: 'client' | 'daemon_process'
  private heartbeatTimer: any | null
  private heartbeatInterval = 1000
  private retryCount: number
  constructor(
    options: {
      openHeartbeat?: boolean
      heartbeatInterval?: number
      runtime?: 'client' | 'daemon_process'
    } = {},
  ) {
    console.log('[ContentScriptConnectionV2]: init')
    // 初始化心跳计时器
    this.heartbeatTimer = null
    // 初始化重试次数
    this.retryCount = 0
    // 初始化运行环境
    this.runtime = options.runtime || 'client'
    // 初始化心跳间隔
    this.heartbeatInterval = options.heartbeatInterval || 1000
    // 是否开启心跳
    if (options.openHeartbeat) {
      this.startHeartbeat()
    }
  }
  async postMessage(msg: {
    event: IChromeExtensionClientSendEvent | IOpenAIChatSendEvent
    data?: any
  }): Promise<{
    success: boolean
    message: string
    data: any
  }> {
    try {
      const result = await Browser.runtime.sendMessage({
        id: CHROME_EXTENSION_POST_MESSAGE_ID,
        event: msg.event,
        data: {
          ...msg.data,
          _RUNTIME_: this.runtime,
        },
      })
      this.retryCount = 0
      return result
    } catch (e) {
      console.log(
        '[ContentScriptConnectionV2]: send error',
        e,
        '\ndata:\t',
        msg,
      )
      return {
        success: false,
        message: (e as any).message,
        data: {},
      }
      // if (this.retryCount < 10) {
      //   console.log('[ContentScriptConnectionV2]: retry', this.retryCount)
      //   this.retryCount++
      //   return await this.postMessage(msg)
      // }
      // return {
      //   success: false,
      //   message: 'retry 10 times',
      //   data: {},
      // }
    }
  }
  private startHeartbeat() {
    console.log('[ContentScriptConnectionV2]: heartbeat start')
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      // TODO 先不发送心跳
    }, this.heartbeatInterval)
  }
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      console.log('[ContentScriptConnectionV2]: heartbeat stop')
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }
  destroy() {
    console.log('[ContentScriptConnectionV2]: destroy')
    this.stopHeartbeat()
  }
}
