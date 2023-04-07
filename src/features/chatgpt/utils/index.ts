import {
  IChromeExtensionChatGPTDaemonProcessListenTaskEvent,
  IChromeExtensionChatGPTDaemonProcessSendEvent,
  IChromeExtensionClientSendEvent,
} from '@/background'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { useCallback } from 'react'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { useSetRecoilState } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'

export const pingDaemonProcess = () => {
  const port = new ContentScriptConnection()
  if (!port) {
    return Promise.resolve(false)
  }
  return new Promise<boolean>((resolve) => {
    let isTimeout = false
    let timer: any = undefined
    const onceListener = (msg: any) => {
      if (msg?.id && msg.id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
        return
      }
      if (msg.event === 'Client_ListenPong' && !isTimeout) {
        clearTimeout(timer as number)
        Browser?.runtime?.onMessage?.removeListener(onceListener)
        port.destroy()
        console.log('ping result', !isTimeout)
        resolve(true)
      }
    }
    port.onMessage(onceListener)
    Browser.runtime.onMessage.addListener(onceListener)
    port.postMessage({
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_checkChatGPTStatus',
    })
    port.postMessage({
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_Ping',
      data: {},
    })
    timer = setTimeout(() => {
      isTimeout = true
      // port.postMessage({
      //   id: CHROME_EXTENSION_POST_MESSAGE_ID,
      //   event: 'Client_openChatGPTDaemonProcess',
      //   data: {},
      // })
      setTimeout(() => {
        Browser?.runtime?.onMessage?.removeListener(onceListener)
        port.destroy()
        resolve(false)
      }, 500)
    }, 2000)
  })
}
export const pingUntilLogin = () => {
  const port = new ContentScriptConnection()
  if (!port) {
    return Promise.reject(false)
  }
  return new Promise<boolean>((resolve, reject) => {
    pingDaemonProcess().then((success) => {
      if (success) {
        // 直接ping成功了
        resolve(true)
      } else {
        console.log('开始等待登录成功')
        let timer: any = 0
        let maxRetry = 120
        // 等待登录成功
        const listener = async (msg: any) => {
          if (msg?.id && msg.id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
            return
          }
          if (msg.event === 'Client_ChatGPTStatusUpdate') {
            console.log(msg.data, msg.data.status)
            if (msg.data.status === 'success') {
              console.log('登录成功!!!')
              clearInterval(timer)
              Browser?.runtime?.onMessage?.removeListener(listener)
              port.destroy()
              const delay = (ms: number) =>
                new Promise((resolve) => setTimeout(resolve, ms))
              await delay(0)
              resolve(true)
            }
          }
        }
        port.onMessage(listener)
        Browser.runtime.onMessage.addListener(listener)
        timer = setInterval(() => {
          port.postMessage({
            id: CHROME_EXTENSION_POST_MESSAGE_ID,
            event: 'Client_checkChatGPTStatus',
            data: {},
          })
          maxRetry--
          if (maxRetry <= 0) {
            console.log('登录超时!!!')
            clearInterval(timer)
            Browser?.runtime?.onMessage?.removeListener(listener)
            port.destroy()
            reject(false)
          }
        }, 1000)
      }
    })
  })
}

export const useSendAsyncTask = () => {
  const setChatGPTClient = useSetRecoilState(ChatGPTClientState)
  return useCallback(
    (
      event: IChromeExtensionChatGPTDaemonProcessListenTaskEvent,
      data: any,
      options?: {
        onMessage?: (data: any) => void
        onError?: (error: string) => void
      },
    ) => {
      return new Promise((resolve, reject) => {
        const port = new ContentScriptConnection()
        console.log('[ChatGPT Module] create task step 1')
        pingDaemonProcess()
          .then((isConnectionAlive) => {
            if (isConnectionAlive !== true) {
              console.log('ping error')
              reject('ping error')
              return
            }
            if (port) {
              console.log('[ChatGPT Module] create task step 2')
              const { onMessage, onError } = options || {}
              const taskId = uuidV4()
              let isPromiseFulfilled = false
              const onceListener = (msg: any) => {
                const { event, data } = msg
                if (msg?.id && msg.id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
                  return
                }
                if (event === `Client_AsyncTaskResponse_${taskId}`) {
                  console.log(data)
                  const {
                    taskId,
                    data: chatGPTDaemenProcessData,
                    done,
                    error,
                  } = data
                  console.log(
                    'chatGPTDaemenProcessData',
                    chatGPTDaemenProcessData,
                    taskId,
                  )
                  if (error) {
                    console.log('[ChatGPT Module] create task [error]', error)
                    onError && onError(error)
                    if (done) {
                      console.log('[ChatGPT Module] create task [error] done')
                      Browser?.runtime?.onMessage?.removeListener(onceListener)
                      port.destroy()
                      !isPromiseFulfilled && reject(error)
                      isPromiseFulfilled = true
                    }
                  }
                  if (done) {
                    console.log('[ChatGPT Module] create task [success] done')
                    Browser?.runtime?.onMessage?.removeListener(onceListener)
                    port.destroy()
                    !isPromiseFulfilled &&
                      resolve(chatGPTDaemenProcessData || true)
                    isPromiseFulfilled = true
                  } else {
                    console.log(
                      '[ChatGPT Module] create task step [success]',
                      chatGPTDaemenProcessData,
                    )
                    onMessage && onMessage(chatGPTDaemenProcessData)
                  }
                }
              }
              port.onMessage(onceListener)
              Browser.runtime.onMessage.addListener(onceListener)
              port.postMessage({
                id: CHROME_EXTENSION_POST_MESSAGE_ID,
                event: 'Client_createAsyncTask',
                data: {
                  taskId,
                  event,
                  data,
                },
              })
              setChatGPTClient((prevState) => {
                return {
                  ...prevState,
                  aborts: prevState.aborts.concat([
                    () => {
                      if (isPromiseFulfilled) {
                        return
                      }
                      console.log('abort!!!!!!!!!!!')
                      isPromiseFulfilled = true
                      onError && onError(`Error detected. Please try again.`)
                      reject(`Error detected. Please try again.`)
                    },
                  ]),
                }
              })
            } else {
              console.log(
                '[ChatGPT Module] create task [error]',
                `Please wait for the daemon process to start.`,
              )
              reject('Please wait for the daemon process to start.')
            }
          })
          .catch((e) => {
            console.log('ping error', e)
            reject('Please wait for the daemon process to start.')
          })
      })
    },
    [],
  )
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
