/**
 * 初始化chat客户端
 */
import { useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil'

import { IChromeExtensionClientListenEvent } from '@/background/app'
import { useCreateClientMessageListener } from '@/background/utils'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { useFloatingContextMenu } from '@/features/contextMenu'
import { replaceMarkerContent } from '@/features/contextMenu/utils/selectionHelper'
import {
  debounceUpdateSidebarChatBoxStyle,
  isShowChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { AppDBStorageState, AppLocalStorageState } from '@/store'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'

/**
 * 接受Background发送的消息
 */
const useClientMessageListenerForBackground = () => {
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
      case 'Client_updateSidebarChatBoxStyle': {
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
        return {
          success: true,
          data: {},
          message: '',
        }
      }
      case 'Client_updateAppSettings': {
        setAppDBStorage(await clientGetLiteChromeExtensionDBStorage())
        setAppLocalStorage(await getChromeExtensionLocalStorage())
        return {
          success: true,
          data: {},
          message: '',
        }
      }
      case 'Client_listenUpdateIframeInput': {
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
      default:
        break
    }
    return undefined
  })
}

export default useClientMessageListenerForBackground
