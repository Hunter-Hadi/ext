/**
 * 初始化在gmail的chatGPT客户端
 */
import { useSetRecoilState } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { useEffect } from 'react'
import Browser from 'webextension-polyfill'
import { IChromeExtensionClientListenEvent } from '@/background'
import { ChatBoxIsOpen, hideChatBox, showChatBox } from '@/utils'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { AppState } from '@/store'
import { ContentScriptConnection } from '@/features/chatgpt/utils'

const useInitChatGPTClient = () => {
  const setChatGPT = useSetRecoilState(ChatGPTClientState)
  const setAppState = useSetRecoilState(AppState)
  useEffect(() => {
    const port = new ContentScriptConnection()
    const listener = (msg: any) => {
      const { event, data } = msg
      if (msg?.id && msg.id !== CHROME_EXTENSION_POST_MESSAGE_ID) {
        return
      }
      switch (event as IChromeExtensionClientListenEvent) {
        case 'Client_ChatGPTStatusUpdate':
          {
            console.log('useInitChatGPTClient listener', data.status)
            setChatGPT((prevState) => {
              if (data.status !== 'success') {
                prevState.aborts.forEach((fn) => fn())
                return {
                  loaded: false,
                  status: data.status,
                  aborts: [],
                }
              }
              return {
                loaded: true,
                status: data.status,
                aborts: prevState.aborts,
              }
            })
          }
          break
        case 'Client_ListenOpenChatMessageBox':
          {
            if (ChatBoxIsOpen()) {
              hideChatBox()
              setAppState((prevState) => {
                return {
                  ...prevState,
                  open: false,
                }
              })
            } else {
              showChatBox()
              setAppState((prevState) => {
                return {
                  ...prevState,
                  open: true,
                }
              })
            }
          }
          break
        default:
          break
      }
    }
    const onFocus = () => {
      port &&
        port.postMessage({
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'Client_checkChatGPTStatus',
        })
    }
    port.onMessage(listener)
    Browser.runtime.onMessage.addListener(listener)
    port.postMessage({
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_checkChatGPTStatus',
    })
    window.addEventListener('focus', onFocus)
    const updateIcon = () => {
      const isDarkModeEnabled =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      console.log('mode', isDarkModeEnabled ? 'dark' : 'light')
      port.postMessage({
        id: CHROME_EXTENSION_POST_MESSAGE_ID,
        event: 'Client_updateIcon',
        data: {
          mode: isDarkModeEnabled ? 'dark' : 'light',
        },
      })
    }
    // theme mode change
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', updateIcon)
    updateIcon()
    return () => {
      window.removeEventListener('focus', onFocus)
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', updateIcon)
      Browser?.runtime?.onMessage?.removeListener(listener)
      port?.destroy()
    }
  }, [])
}

export { useInitChatGPTClient }
