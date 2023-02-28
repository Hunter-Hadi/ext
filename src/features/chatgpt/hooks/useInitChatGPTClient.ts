/**
 * 初始化在gmail的chatGPT客户端
 */
import { useSetRecoilState } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { useEffect } from 'react'
import Browser from 'webextension-polyfill'
import { IChromeExtensionClientListenEvent } from '@/background'
import { EzMailBoxIsOpen, hideEzMailBox, showEzMailBox } from '@/features/gmail'

const useInitChatGPTClient = () => {
  const setChatGPT = useSetRecoilState(ChatGPTClientState)
  useEffect(() => {
    const port = Browser.runtime.connect()
    const listener = (msg: any) => {
      const { event, data } = msg
      switch (event as IChromeExtensionClientListenEvent) {
        case 'Client_ChatGPTStatusUpdate':
          {
            console.log('useInitChatGPTClient listener', data.status)
            setChatGPT((prevState) => {
              if (prevState.status !== data.status) {
                prevState.aborts.forEach((fn) => fn())
              }
              return {
                loaded: true,
                status: data.status,
                aborts: [],
                port,
              }
            })
          }
          break
        case 'Client_ListenOpenChatMessageBox':
          {
            if (EzMailBoxIsOpen()) {
              hideEzMailBox()
            } else {
              showEzMailBox()
            }
          }
          break
        default:
          break
      }
    }
    const onFocus = () => {
      port && port.postMessage({ event: 'Client_checkChatGPTStatus' })
    }
    port.onMessage.addListener(listener)
    Browser.runtime.onMessage.addListener(listener)
    port.postMessage({ event: 'Client_checkChatGPTStatus' })
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      port?.onMessage?.removeListener(listener)
      Browser?.runtime?.onMessage?.removeListener(listener)
      port?.disconnect()
    }
  }, [])
}

export { useInitChatGPTClient }
