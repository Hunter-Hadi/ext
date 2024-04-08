import Stack from '@mui/material/Stack'
import React, { useMemo, useState } from 'react'

import { ConversationStatusType } from '@/background/provider/chat'
import {
  ChatPanelContext,
  ChatPanelContextValue,
} from '@/features/chatgpt/store/ChatPanelContext'
import SidebarPromotionDialog from '@/features/sidebar/components/SidebarChatBox/SidebarPromotionDialog'
import SidebarTour from '@/features/sidebar/components/SidebarChatBox/SidebarTour'
import SidebarChatPanel from '@/features/sidebar/components/SidebarChatPanel'
import SidebarNav from '@/features/sidebar/components/SidebarNav'
import useSidebarDropEvent from '@/features/sidebar/hooks/useSidebarDropEvent'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

// const getDefaultValue = () => {
//   const autoFocusInputValue = (
//     document.querySelector('input[autoFocus]') as HTMLInputElement
//   )?.value
//   return autoFocusInputValue || 'Enter ChatGPT prompt...'
// }

const SidebarPage = () => {
  const {
    currentSidebarConversationId,
    createSidebarConversation,
    resetSidebarConversation,
  } = useSidebarSettings()

  const { handleDragEnter, handleDragOver, handleDragLeave, handleDrop } =
    useSidebarDropEvent()
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
        {!isMaxAIImmersiveChatPage() && <ChatBoxHeader />}
        <ChatPanelContext.Provider value={sidebarContextValue}>
          <SidebarChatPanel />
        </ChatPanelContext.Provider>
      </Stack>
      {!isMaxAIImmersiveChatPage() && <SidebarNav />}
    </Stack>
  )
}
export default SidebarPage
