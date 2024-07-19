import { useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import { PaginationConversationMessagesStateFamily } from '@/features/chatgpt/store'
import { useChatPanelContext } from '@/features/chatgpt/store/ChatPanelContext'
import {
  ContextMenuOpenSelector,
  ContextMenuPinedToSidebarState,
  PinToSidebarState,
} from '@/features/contextMenu/store'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ClientWritingMessageStateFamily } from '@/features/sidebar/store'

export default function useContinueInSidebarListener() {
  const { conversationId = '' } = useChatPanelContext()
  const clientWritingMessage = useRecoilValue(
    ClientWritingMessageStateFamily(conversationId),
  )
  const { continueConversationInSidebar, updateSidebarSettings } =
    useSidebarSettings()

  const clientConversationMessages = useRecoilValue(
    PaginationConversationMessagesStateFamily(conversationId),
  )
  const setContextMenuPinedToSidebar = useSetRecoilState(
    ContextMenuPinedToSidebarState,
  )
  const [pinToSidebar, setPinToSidebar] = useRecoilState(PinToSidebarState)
  const floatingOpen = useRecoilValue(ContextMenuOpenSelector)

  const callingRef = useRef(false)

  /**
   * 当设置了永远sidebar中进行时，关闭跳转
   * 这里要用监听实现是因为会有shortcuts并没有输出message，
   * 需要当有clientWritingMessage的时候去再去打开sidebar
   */
  useEffect(() => {
    const fn = async () => {
      if (callingRef.current) return

      callingRef.current = true

      if (
        !floatingOpen ||
        !clientWritingMessage.loading ||
        clientConversationMessages.length === 0
      ) {
        callingRef.current = false
        return
      }

      if (pinToSidebar.once || pinToSidebar.always) {
        await continueConversationInSidebar(
          conversationId,
          {},
          { syncConversationToDB: true, waitSync: true },
          false,
        )

        // 清除once
        if (pinToSidebar.always) {
          setContextMenuPinedToSidebar(true)
        } else {
          setPinToSidebar({
            always: false,
            once: false,
          })
        }

        callingRef.current = false

        return
      }

      // 同步conversationId到侧边栏
      await updateSidebarSettings({
        contextMenu: {
          conversationId,
        },
      })
      callingRef.current = false
    }
    fn()
  }, [
    floatingOpen,
    clientWritingMessage,
    clientConversationMessages,
    conversationId,
  ])
}
/**
 *  用来记录是否有过会话存储在sidebar
 */
// const [contextMenuPined, setContextMenuPined] = useState(false)
//
// useEffect(() => {
//   if (
//     contextMenuConversationId === currentConversationId &&
//     pinToSidebar.always
//   ) {
//     setContextMenuPined(true)
//   }
//
//   if (contextMenuPined && !pinToSidebar.always) {
//     setContextMenuPined(false)
//   }
// }, [contextMenuConversationId, currentConversationId, pinToSidebar.always])
