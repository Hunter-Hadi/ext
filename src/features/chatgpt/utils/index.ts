import { IChromeExtensionChatGPTDaemonProcessListenTaskEvent } from '@/background'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { useRecoilState } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { useCallback } from 'react'

export const pingDaemonProcess = () => {
  const port = Browser.runtime.connect()
  if (!port) {
    return Promise.resolve(false)
  }
  return new Promise<boolean>((resolve) => {
    let isTimeout = false
    let timer: any = undefined
    const onceListener = (msg: any) => {
      if (msg.event === 'Client_ListenPong' && !isTimeout) {
        clearTimeout(timer as number)
        Browser?.runtime?.onMessage?.removeListener(onceListener)
        port?.onMessage?.removeListener(onceListener)
        console.log('ping result', !isTimeout)
        resolve(true)
      }
    }
    port.onMessage.addListener(onceListener)
    Browser.runtime.onMessage.addListener(onceListener)
    port.postMessage({ event: 'Client_checkChatGPTStatus' })
    port.postMessage({
      event: 'Client_Ping',
      data: {},
    })
    timer = setTimeout(() => {
      isTimeout = true
      port.postMessage({
        event: 'Client_openChatGPTDaemonProcess',
        data: {},
      })
      setTimeout(() => {
        Browser?.runtime?.onMessage?.removeListener(onceListener)
        port.onMessage.removeListener(onceListener)
        resolve(false)
      }, 500)
    }, 2000)
  })
}
export const pingUntilLogin = () => {
  const port = Browser.runtime.connect()
  if (!port) {
    return Promise.reject(false)
  }
  return new Promise<boolean>((resolve, reject) => {
    pingDaemonProcess().then((success) => {
      if (success) {
        // 直接ping成功了
        resolve(true)
      } else {
        console.log('等待登录成功')
        let timer: any = 0
        let maxRetry = 120
        // 等待登录成功
        const listener = async (msg: any) => {
          if (msg.event === 'Client_ChatGPTStatusUpdate') {
            console.log(msg.data, msg.data.status)
            if (msg.data.status === 'success') {
              clearInterval(timer)
              Browser?.runtime?.onMessage?.removeListener(listener)
              port?.onMessage?.removeListener(listener)
              const delay = (ms: number) =>
                new Promise((resolve) => setTimeout(resolve, ms))
              await delay(0)
              resolve(true)
            }
          }
        }
        port.onMessage.addListener(listener)
        Browser.runtime.onMessage.addListener(listener)
        timer = setInterval(() => {
          port.postMessage({
            event: 'Client_checkChatGPTStatus',
            data: {},
          })
          maxRetry--
          if (maxRetry <= 0) {
            clearInterval(timer)
            Browser?.runtime?.onMessage?.removeListener(listener)
            port?.onMessage?.removeListener(listener)
            reject(false)
          }
        }, 1000)
      }
    })
  })
}
export const sendAsyncTask = async (
  event: IChromeExtensionChatGPTDaemonProcessListenTaskEvent,
  data: any,
) => {
  await pingDaemonProcess()
  const taskId = uuidV4()
  const port = Browser.runtime.connect()
  if (!port) {
    return Promise.resolve(false)
  }
  return new Promise<any>((resolve) => {
    const onceListener = (msg: any) => {
      const { event, data } = msg
      if (event === `Client_AsyncTaskResponse_${taskId}`) {
        console.log(data)
        const { taskId, data: chatGPTDaemenProcessData, done, error } = data
        console.log(
          'chatGPTDaemenProcessData',
          chatGPTDaemenProcessData,
          taskId,
        )
        if (error) {
          if (done) {
            Browser?.runtime?.onMessage?.removeListener(onceListener)
            port?.onMessage?.removeListener(onceListener)
          }
        }
        if (done) {
          Browser?.runtime?.onMessage?.removeListener(onceListener)
          port?.onMessage?.removeListener(onceListener)
          resolve(chatGPTDaemenProcessData || true)
        }
      }
    }
    port.onMessage.addListener(onceListener)
    Browser.runtime.onMessage.addListener(onceListener)
    port.postMessage({
      event: 'Client_createAsyncTask',
      data: {
        taskId,
        event,
        data,
      },
    })
  })
}

export const useSendAsyncTask = () => {
  const [chatGPTClient, setChatGPTClient] = useRecoilState(ChatGPTClientState)
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
        pingDaemonProcess().then((isConnectionAlive) => {
          if (isConnectionAlive !== true) {
            console.log('ping error')
            reject('ping error')
            return
          }
          console.log(4)
          if (chatGPTClient.port && chatGPTClient.loaded) {
            console.log(5)
            const { onMessage, onError } = options || {}
            const taskId = uuidV4()
            let isPromiseFulfilled = false
            const onceListener = (msg: any) => {
              const { event, data } = msg
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
                  onError && onError(error)
                  if (done) {
                    Browser?.runtime?.onMessage?.removeListener(onceListener)
                    chatGPTClient.port?.onMessage?.removeListener(onceListener)
                    !isPromiseFulfilled && reject(error)
                    isPromiseFulfilled = true
                  }
                }
                if (done) {
                  Browser?.runtime?.onMessage?.removeListener(onceListener)
                  chatGPTClient.port?.onMessage?.removeListener(onceListener)
                  !isPromiseFulfilled &&
                    resolve(chatGPTDaemenProcessData || true)
                  isPromiseFulfilled = true
                } else {
                  onMessage && onMessage(chatGPTDaemenProcessData)
                }
              }
            }
            chatGPTClient.port.onMessage.addListener(onceListener)
            Browser.runtime.onMessage.addListener(onceListener)
            chatGPTClient.port.postMessage({
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
            reject('Please wait for the daemon process to start.')
          }
        })
      })
    },
    [chatGPTClient.port, chatGPTClient.loaded],
  )
}
