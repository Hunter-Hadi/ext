/**
 * 初始化chat客户端
 */
import { useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil'

import { IChromeExtensionClientListenEvent } from '@/background/app'
import { useCreateClientMessageListener } from '@/background/utils'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { useFloatingContextMenu } from '@/features/contextMenu'
import { replaceMarkerContent } from '@/features/contextMenu/utils/selectionHelper'
import { AppDBStorageState, AppLocalStorageState } from '@/store'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import Log from '@/utils/Log'

const log = new Log('InitChatGPT')

const useInitChatGPTClient = () => {
  const setChatGPT = useSetRecoilState(ChatGPTClientState)
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const setAppLocalStorage = useSetRecoilState(AppLocalStorageState)
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
          setAppDBStorage(await clientGetLiteChromeExtensionDBStorage())
          setAppLocalStorage(await getChromeExtensionLocalStorage())
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
            await replaceMarkerContent(
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
    }
    port.postMessage({
      event: 'Client_checkChatGPTStatus',
    })
    checkChatGPTStatus()
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      port?.destroy()
    }
  }, [])
}

export { useInitChatGPTClient }
