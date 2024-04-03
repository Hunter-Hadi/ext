import React, { FC, useMemo, useState } from 'react'

import { ChatStatus } from '@/background/provider/chat'
import CustomPortal from '@/components/CustomPortal'
import {
  ChatPanelContext,
  ChatPanelContextValue,
} from '@/features/chatgpt/store/ChatPanelContext'
import { MAXAI_CONTEXT_MENU_ID } from '@/features/common/constants'
import { FloatingContextMenu } from '@/features/contextMenu/components/FloatingContextMenu'
import FloatingShortCutsTip from '@/features/contextMenu/components/FloatingContextMenu/FloatingShortCutsTip'
import FloatingMiniMenu from '@/features/contextMenu/components/FloatingMiniMenu'
import InputAssistantButtonPortal from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonPortal'
import useFloatingContextMenuDraft from '@/features/contextMenu/hooks/useFloatingContextMenuDraft'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const ContextMenuRoot: FC = () => {
  const [conversationId, setConversationId] = useState<string>('')
  const [chatStatus, updateChatStatus] = useState<ChatStatus>('success')
  const { createSidebarConversation } = useSidebarSettings()
  const { resetFloatingContextMenuDraft } = useFloatingContextMenuDraft()
  const ChatPanelContextValue = useMemo<ChatPanelContextValue>(() => {
    return {
      chatStatus,
      updateChatStatus,
      createConversation: async (conversationType, AIProvider, AIModel) => {
        const newConversationId = await createSidebarConversation(
          conversationType,
          AIProvider,
          AIModel,
        )
        setConversationId(newConversationId)
        return newConversationId
      },
      resetConversation: async () => {
        resetFloatingContextMenuDraft()
      },
      conversationId,
      setConversationId,
    }
  }, [conversationId])
  return (
    <>
      <CustomPortal containerId={MAXAI_CONTEXT_MENU_ID}>
        {(props) => {
          return (
            <ChatPanelContext.Provider value={ChatPanelContextValue}>
              <FloatingContextMenu root={props.rootContainer} />
              <FloatingShortCutsTip />
              <FloatingMiniMenu />
            </ChatPanelContext.Provider>
          )
        }}
      </CustomPortal>
      <InputAssistantButtonPortal />
    </>
  )
}

export default ContextMenuRoot
