import Stack from '@mui/material/Stack'
import React, { FC, useMemo, useState } from 'react'

import { ConversationStatusType } from '@/background/provider/chat'
import useInitWebPageMessageChannel from '@/components/AppInit/useInitWebPageMessageChannel'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import {
  ChatPanelContext,
  ChatPanelContextValue,
} from '@/features/chatgpt/store/ChatPanelContext'
import SidebarPromotionDialog from '@/features/sidebar/components/SidebarChatBox/SidebarPromotionDialog'
import SidebarScreenshotButton from '@/features/sidebar/components/SidebarChatBox/SidebarScreenshortButton'
import SidebarTour from '@/features/sidebar/components/SidebarChatBox/SidebarTour'
import SidebarNav from '@/features/sidebar/components/SidebarNav'
import useInitSidebar from '@/features/sidebar/hooks/useInitSidebar'
import useSidebarDropEvent from '@/features/sidebar/hooks/useSidebarDropEvent'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'

// const getDefaultValue = () => {
//   const autoFocusInputValue = (
//     document.querySelector('input[autoFocus]') as HTMLInputElement
//   )?.value
//   return autoFocusInputValue || 'Enter ChatGPT prompt...'
// }
const SidebarChatPanel = React.lazy(
  () => import('@/features/sidebar/components/SidebarChatPanel'),
)

/**
 * 一些自定义/监听需要在没渲染前就初始化的操作
 * @constructor
 */
const SidebarPageInit: FC = () => {
  useInitSidebar()
  useInitWebPageMessageChannel()
  return <></>
}

const SidebarPage: FC<{
  isImmersiveChat?: boolean
  open?: boolean
}> = (props) => {
  const { isImmersiveChat, open = false } = props
  const { handleDragEnter, handleDragOver, handleDragLeave, handleDrop } =
    useSidebarDropEvent()
  const {
    currentSidebarConversationId,
    createSidebarConversation,
    resetSidebarConversation,
  } = useSidebarSettings()
  const [conversationStatus, setConversationStatus] =
    useState<ConversationStatusType>('success')
  const sidebarContextValue = useMemo<ChatPanelContextValue>(() => {
    return {
      conversationStatus,
      updateConversationStatus: (newStatus: ConversationStatusType) => {
        setConversationStatus(newStatus)
      },
      conversationId: currentSidebarConversationId,
      createConversation: createSidebarConversation,
      resetConversation: resetSidebarConversation,
    }
  }, [currentSidebarConversationId, conversationStatus])
  return (
    <ChatPanelContext.Provider value={sidebarContextValue}>
      <SidebarPageInit />
      {open && (
        <Stack
          flex={1}
          height={0}
          position={'relative'}
          direction="row"
          id={'MaxAISidebarContainer'}
        >
          <SidebarTour />
          <SidebarPromotionDialog />
          <Stack
            component={'div'}
            position={'relative'}
            flex={1}
            width={0}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop as any}
          >
            {!isImmersiveChat && <ChatBoxHeader />}
            <AppSuspenseLoadingLayout>
              <SidebarChatPanel />
            </AppSuspenseLoadingLayout>
          </Stack>
          {!isImmersiveChat && <SidebarNav />}
          {!open && (
            <>
              {/*// 为了在Sidebar没有渲染的时候能执行shortcuts*/}
              {/* 在 click MaxAIScreenshotMiniButton 时 通过找到下面这个隐藏的 SidebarScreenshotButton 组件触发 click 事件，来实现截图  */}
              <SidebarScreenshotButton
                enabled={!open}
                sx={{
                  position: 'absolute',
                  visibility: 'hidden',
                  width: 0,
                  height: 0,
                  opacity: 0,
                }}
              />
              {/*<ActionSetVariablesModal modelKey={'Sidebar'} />*/}
            </>
          )}
        </Stack>
      )}
    </ChatPanelContext.Provider>
  )
}
export default SidebarPage
