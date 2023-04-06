/**
 * 初始化在gmail的chatGPT客户端
 */
import { useSetRecoilState } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { useEffect, useRef } from 'react'
import Browser from 'webextension-polyfill'
import { IChromeExtensionClientListenEvent } from '@/background'
import { ChatBoxIsOpen, hideChatBox, showChatBox } from '@/utils'
import {
  CHAT_GPT_MESSAGES_RECOIL_KEY,
  CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/types'
import { AppSettingsState, AppState } from '@/store'
import { ContentScriptConnection } from '@/features/chatgpt/utils'
import { useFloatingContextMenu } from '@/features/contextMenu/hooks/useFloatingContextMenu'
import { ChatGPTMessageState } from '@/features/gmail/store'

const useInitChatGPTClient = () => {
  const setChatGPT = useSetRecoilState(ChatGPTClientState)
  const setAppState = useSetRecoilState(AppState)
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const updateMessages = useSetRecoilState(ChatGPTMessageState)
  const { showFloatingContextMenu } = useFloatingContextMenu()
  const showFloatingContextMenuRef = useRef(showFloatingContextMenu)
  useEffect(() => {
    showFloatingContextMenuRef.current = showFloatingContextMenu
  }, [showFloatingContextMenu])
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
            const isShowFloatingContextMenu =
              showFloatingContextMenuRef.current()
            if (data?.type === 'action') {
              // 不支持的网站设置
            }
            // 如果浮动菜单显示，则不处理
            if (!isShowFloatingContextMenu) {
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
          }
          break
        case 'Client_updateAppSettings':
          {
            setAppSettings(data)
          }
          break
        default:
          break
      }
    }
    const fetchLocalMessages = async () => {
      const result: any = await Browser.storage.local.get(
        CHAT_GPT_MESSAGES_RECOIL_KEY,
      )
      if (result[CHAT_GPT_MESSAGES_RECOIL_KEY]) {
        try {
          const localMessages: any = JSON.parse(
            result[CHAT_GPT_MESSAGES_RECOIL_KEY],
          )
          if (localMessages && localMessages instanceof Array) {
            updateMessages(localMessages)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
    const onFocus = async () => {
      port &&
        port.postMessage({
          id: CHROME_EXTENSION_POST_MESSAGE_ID,
          event: 'Client_checkChatGPTStatus',
        })
      await fetchLocalMessages()
    }
    port.onMessage(listener)
    Browser.runtime.onMessage.addListener(listener)
    port.postMessage({
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_checkChatGPTStatus',
    })
    fetchLocalMessages()
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      Browser?.runtime?.onMessage?.removeListener(listener)
      port?.destroy()
    }
  }, [])
}

export { useInitChatGPTClient }
