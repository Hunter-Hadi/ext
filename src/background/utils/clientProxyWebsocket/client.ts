import WebSocketAsPromised from 'websocket-as-promised'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { websocketUtils } from '@/background/src/chat/BingChat/bing/utils'
import { createClientMessageListener } from '@/background/utils'
import {
  ClientProxyWebSocketActionType,
  ClientProxyWebSocketSceneType,
} from '@/background/utils/clientProxyWebsocket/background'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'

const initClientProxyWebsocket = () => {
  const websocketMap = new Map<string, WebSocketAsPromised>()
  const port = new ContentScriptConnectionV2()
  const postMessage = async (
    taskId: string,
    data: any,
    listenerType: string,
  ) => {
    await port.postMessage({
      event: 'Client_ListenProxyWebsocketResponse',
      data: {
        data,
        taskId,
        listenerType,
      },
    })
  }
  createClientMessageListener(async (event, data) => {
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_ListenProxyWebsocket':
        {
          const { taskId, data: websocketData, type } = data
          switch (type as ClientProxyWebSocketActionType) {
            case 'Open':
              {
                const mode = websocketData.mode as ClientProxyWebSocketSceneType
                const wsp = new WebSocketAsPromised(
                  websocketData.url,
                  mode === 'bing'
                    ? {
                        packMessage: websocketUtils.packMessage,
                        unpackMessage: websocketUtils.unpackMessage,
                      }
                    : {},
                )
                wsp.onUnpackedMessage.addListener((events: any) => {
                  postMessage(taskId, events, 'onUnpackedMessage')
                })
                wsp.onMessage.addListener(async (events: any) => {
                  postMessage(taskId, events, 'onMessage')
                })
                wsp.onClose.addListener(() => {
                  postMessage(taskId, {}, 'onClose')
                })
                await wsp.open()
                websocketMap.set(taskId, wsp)
                return {
                  success: true,
                  data: 'success',
                  message: 'ok',
                }
              }
              break
            case 'Close':
              {
                const wsp = websocketMap.get(taskId)
                if (!wsp) {
                  return {
                    success: false,
                    message: 'websocket not found',
                    data: false,
                  }
                }
                wsp.removeAllListeners()
                await wsp.close()
                websocketMap.delete(taskId)
                return {
                  success: true,
                  data: 'success',
                  message: 'ok',
                }
              }
              break
            case 'SendPacked':
              {
                const wsp = websocketMap.get(taskId)
                if (!wsp) {
                  return {
                    success: false,
                    message: 'websocket not found',
                    data: false,
                  }
                }
                wsp.sendPacked(websocketData)
                return {
                  success: true,
                  data: 'success',
                  message: 'ok',
                }
              }
              break
            default: {
              return {
                success: true,
                data: 'success',
                message: 'ok',
              }
            }
          }
        }
        break
    }
    return undefined
  })
}
export default initClientProxyWebsocket
