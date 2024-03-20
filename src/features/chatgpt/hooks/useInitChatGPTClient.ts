/**
 * 初始化chat客户端
 */
import cloneDeep from 'lodash-es/cloneDeep'
import { useEffect, useRef } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'

import { IChromeExtensionClientListenEvent } from '@/background/app'
import { useCreateClientMessageListener } from '@/background/utils'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import {
  ChatGPTClientState,
  ClientConversationMapState,
} from '@/features/chatgpt/store'
import { useFloatingContextMenu } from '@/features/contextMenu'
import { replaceMarkerContent } from '@/features/contextMenu/utils/selectionHelper'
import {
  debounceUpdateSidebarChatBoxStyle,
  isShowChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { AppDBStorageState, AppLocalStorageState } from '@/store'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'
import Log from '@/utils/Log'

const log = new Log('InitChatGPT')

const useInitChatGPTClient = () => {
  const setChatGPT = useSetRecoilState(ChatGPTClientState)
  const [, setClientConversationMap] = useRecoilState(
    ClientConversationMapState,
  )
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const setAppLocalStorage = useSetRecoilState(AppLocalStorageState)
  const { showFloatingContextMenu } = useFloatingContextMenu()
  const showFloatingContextMenuRef = useRef(showFloatingContextMenu)
  const isOpenChatBoxRef = useRef(false)
  useEffect(() => {
    showFloatingContextMenuRef.current = showFloatingContextMenu
  }, [showFloatingContextMenu])
  useCreateClientMessageListener(async (event, data, sender) => {
    // log.info('message', event, data)
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
      case 'Client_updateSidebarChatBoxStyle':
        {
          if (isOpenChatBoxRef.current) {
            debounceUpdateSidebarChatBoxStyle()
          } else {
            console.log(
              'Client_updateSidebarChatBoxStyle 不操作，因为没打开过sidebarChatBox',
            )
            if (isShowChatBox()) {
              isOpenChatBoxRef.current = true
              debounceUpdateSidebarChatBoxStyle()
            }
          }
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
      case 'Client_listenUpdateConversationMessages': {
        const { conversation, conversationId } = data
        if (conversation?.id) {
          setClientConversationMap((prevState) => {
            return {
              ...prevState,
              [conversation.id]: conversation,
            }
          })
        } else if (!conversation) {
          // 如果是删除的话，就不会有conversation
          setClientConversationMap((prevState) => {
            const newState = cloneDeep(prevState)
            delete newState[conversationId]
            return newState
          })
        }
        return {
          success: true,
        }
      }
      default:
        break
    }
    return undefined
  })
}

export { useInitChatGPTClient }
