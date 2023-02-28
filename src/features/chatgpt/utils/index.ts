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
          if (chatGPTClient.port && chatGPTClient.status === 'success') {
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
            if (chatGPTClient.status === 'needAuth') {
              reject('Please login on ChatGPT and pass Cloudflare check.')
            }
          }
        })
      })
    },
    [chatGPTClient.port, chatGPTClient.status],
  )
}
