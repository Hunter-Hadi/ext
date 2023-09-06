import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChromeExtensionSendEvent } from '@/background/eventType'
import {
  createBackgroundMessageListener,
  safeGetBrowserTab,
} from '@/background/utils'
interface IClientProxyWebSocketOptions {
  createWebSocket?: (url: string) => WebSocket
  packMessage?: (data: any) => string | ArrayBuffer | Blob
  unpackMessage?: (data: string | ArrayBuffer | Blob) => any
  attachRequestId?: (data: any, requestId: string | number) => any
  extractRequestId?: (data: any) => string | number | undefined
  extractMessageData?: (event: any) => any
  timeout?: number
  connectionTimeout?: number
}
// 使用场景
type Listener = (event: any) => void
export type ClientProxyWebSocketSceneType = 'normal' | 'bing'
export type ClientProxyWebSocketActionType = 'Open' | 'Close' | 'SendPacked'
export type ClientProxyWebSocketListenerType =
  | 'onUnpackedMessage'
  | 'onClose'
  | 'onMessage'

export class ClientProxyWebSocket {
  id: string
  clientTabId?: number
  options: IClientProxyWebSocketOptions
  url: string
  unpackListeners: Listener[] = []
  closeListeners: Listener[] = []
  messageListeners: Listener[] = []
  clearListener?: () => void
  constructor(url: string, options?: IClientProxyWebSocketOptions) {
    this.id = uuidV4()
    this.url = url
    this.options = options || {}
  }
  async init(clientTabId?: number) {
    const propTab = await safeGetBrowserTab(clientTabId)
    const currentTab = (
      await Browser.tabs.query({
        active: true,
      })
    )?.[0]
    this.clientTabId = propTab?.id || currentTab?.id
    this.clearListener = createBackgroundMessageListener(
      async (runtime, event, data) => {
        if (runtime === 'client') {
          if (event === 'Client_ListenProxyWebsocketResponse') {
            const { taskId, listenerType, data: responseData } = data
            if (taskId === this.id) {
              switch (listenerType) {
                case 'onUnpackedMessage':
                  {
                    for (const listener of this.unpackListeners) {
                      listener(responseData)
                    }
                  }
                  break
                case 'onClose':
                  {
                    for (const listener of this.closeListeners) {
                      listener(responseData)
                    }
                  }
                  break
                case 'onMessage': {
                  for (const listener of this.messageListeners) {
                    listener(responseData)
                  }
                }
              }
              return {
                success: true,
                message: 'ok',
                data: true,
              }
            }
          }
        }
        return undefined
      },
    )
  }
  async open(mode: ClientProxyWebSocketSceneType) {
    await this.sendMessageToClient('Open', {
      url: this.url,
      mode,
    })
  }
  async close() {
    this.removeAllListeners()
    await this.sendMessageToClient('Close', {
      url: this.url,
    })
    this.clearListener?.()
  }
  async sendPacked(data: any) {
    await this.sendMessageToClient('SendPacked', data)
  }
  removeAllListeners() {
    this.onMessage.removeAllListeners()
    this.onUnpackedMessage.removeAllListeners()
    this.onClose.removeAllListeners()
  }
  get onUnpackedMessage() {
    return {
      addListener: (fn: Listener) => {
        this.unpackListeners.push(fn)
      },
      removeListener: (fn: Listener) => {
        this.unpackListeners = this.unpackListeners.filter((f) => f !== fn)
      },
      removeAllListeners: () => {
        this.unpackListeners = []
      },
    }
  }
  get onMessage() {
    return {
      addListener: (fn: Listener) => {
        this.messageListeners.push(fn)
      },
      removeListener: (fn: Listener) => {
        this.messageListeners = this.messageListeners.filter((f) => f !== fn)
      },
      removeAllListeners: () => {
        this.messageListeners = []
      },
    }
  }
  get onClose() {
    return {
      addListener: (fn: Listener) => {
        this.closeListeners.push(fn)
      },
      removeListener: (fn: Listener) => {
        this.closeListeners = this.closeListeners.filter((f) => f !== fn)
      },
      removeAllListeners: () => {
        this.closeListeners = []
      },
    }
  }
  private async sendMessageToClient(
    type: ClientProxyWebSocketActionType,
    data: any,
  ) {
    if (this.clientTabId) {
      try {
        const result = await Browser.tabs.sendMessage(this.clientTabId, {
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          data: {
            taskId: this.id,
            type,
            data,
          },
          event: 'Client_ListenProxyWebsocket' as IChromeExtensionSendEvent,
        })
        return result
      } catch (e) {
        await this.close()
        return null
      }
    }
  }
}
