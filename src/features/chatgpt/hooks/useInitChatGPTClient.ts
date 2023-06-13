/**
 * 初始化在gmail的chatGPT客户端
 */
import { useSetRecoilState } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { useEffect, useRef } from 'react'
import Browser from 'webextension-polyfill'
import { IChromeExtensionClientListenEvent } from '@/background/app'
import { CHAT_GPT_MESSAGES_RECOIL_KEY } from '@/types'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { ChatGPTMessageState } from '@/features/gmail/store'
import {
  getChromeExtensionSettings,
  useCreateClientMessageListener,
} from '@/background/utils'
import Log from '@/utils/Log'
import { useFloatingContextMenu } from '@/features/contextMenu'
import { replaceMarkerContent } from '@/features/contextMenu/utils/selectionHelper'

const log = new Log('InitChatGPT')

const useInitChatGPTClient = () => {
  const setChatGPT = useSetRecoilState(ChatGPTClientState)
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const updateMessages = useSetRecoilState(ChatGPTMessageState)
  const { showFloatingContextMenu } = useFloatingContextMenu()
  const showFloatingContextMenuRef = useRef(showFloatingContextMenu)
  useEffect(() => {
    showFloatingContextMenuRef.current = showFloatingContextMenu
  }, [showFloatingContextMenu])
  useCreateClientMessageListener(async (event, data, sender) => {
    log.info('message', event, data)
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_ChatGPTStatusUpdate':
        {
          log.info('useInitChatGPTClient listener', data.status)
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
          return {
            success: true,
            message: '',
            data: {},
          }
        }
        break
      case 'Client_listenOpenChatMessageBox':
        {
          // const delay = (t: number) =>
          //   new Promise((resolve) => setTimeout(resolve, t))
          // await delay(100)
          // if (data?.type === 'action') {
          //   // 不支持的网站设置
          // }
          // // 1. 获取floating menu 是否展示
          // // 2. 尝试展示floating menu
          // // 3. 如果展示成功，则不处理
          // // 4. 如果展示失败，则展示chatbox
          // const floatingMenuVisible =
          //   isFloatingMenuVisible() || showFloatingContextMenu()
          // // 如果浮动菜单显示，则不处理
          // if (floatingMenuVisible) {
          //   return
          // }
          // if (isShowChatBox()) {
          //   hideChatBox()
          //   setAppState((prevState) => {
          //     return {
          //       ...prevState,
          //       open: false,
          //     }
          //   })
          // } else {
          //   showChatBox()
          //   setAppState((prevState) => {
          //     return {
          //       ...prevState,
          //       open: true,
          //     }
          //   })
          // }
          // return {
          //   success: true,
          //   data: {},
          //   message: '',
          // }
        }
        break
      case 'Client_updateAppSettings':
        {
          const newSettings = await getChromeExtensionSettings()
          setAppSettings(newSettings)
          return {
            success: true,
            data: {},
            message: '',
          }
        }
        break
      case 'Client_listenUpdateIframeInput':
        {
          console.log('Client_listenUpdateIframeInput', data)
          if (data.startMarkerId && data.endMarkerId) {
            replaceMarkerContent(
              data.startMarkerId,
              data.endMarkerId,
              data.value,
              data.type,
            )
          }
          return {
            success: true,
            data: {},
            message: '',
          }
        }
        break
      default:
        break
    }
    return undefined
  })
  useEffect(() => {
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
            updateMessages((prevState) => {
              const lastMessageId = prevState[prevState.length - 1]?.messageId
              const newMessageLastId =
                localMessages[localMessages.length - 1]?.messageId
              if (lastMessageId === newMessageLastId) {
                return prevState
              }
              return localMessages
            })
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
    const checkChatGPTStatus = async () => {
      const result = await port.postMessage({
        event: 'Client_checkChatGPTStatus',
      })
      if (result.success && result.data.status) {
        setChatGPT((prevState) => {
          if (result.data.status !== 'success') {
            prevState.aborts.forEach((fn) => fn())
            return {
              loaded: false,
              status: result.data.status,
              aborts: [],
            }
          }
          return {
            loaded: true,
            status: result.data.status,
            aborts: prevState.aborts,
          }
        })
      }
    }
    const port = new ContentScriptConnectionV2({
      runtime: 'client',
    })
    const onFocus = async () => {
      await checkChatGPTStatus()
      // 由于多处地方会更新 message storage cache，所以在这里延迟一下确保 获取到的 storage cache 是最新的
      setTimeout(async () => {
        await fetchLocalMessages()
      }, 100)
    }
    port.postMessage({
      event: 'Client_checkChatGPTStatus',
    })
    checkChatGPTStatus()
    fetchLocalMessages()
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      port?.destroy()
    }
  }, [])
}

export { useInitChatGPTClient }
