import React, {FC, useMemo, useState} from 'react'

import { ConversationStatusType } from '@/background/provider/chat'
import {
  ChatPanelContext,
  ChatPanelContextValue,
} from '@/features/chatgpt/store/ChatPanelContext'
import useEffectOnce from "@/features/common/hooks/useEffectOnce";
import useSidebarSettings from "@/features/sidebar/hooks/useSidebarSettings";

const ChatContextProvider: FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props

  const { createSidebarConversation } = useSidebarSettings()

  const [conversationStatus, updateConversationStatus] =
    useState<ConversationStatusType>('success')

  const [conversationId, updateConversationId] = useState('')

  const chatContextValue = useMemo<ChatPanelContextValue>(() => {
    return {
      conversationId,
      conversationStatus,
      updateConversationStatus,
      updateConversationId: async (newId) => updateConversationId(newId),
      createConversation: async (conversationType, AIProvider, AIModel) => {
        const newConversationId = await createSidebarConversation('Chat', AIProvider, AIModel)
        updateConversationId(newConversationId)
        return newConversationId
      },
      resetConversation: async () => {},
    }
  }, [conversationId, conversationStatus])

  useEffectOnce(() => {
    chatContextValue.createConversation('Chat')
  })

  return (
    <ChatPanelContext.Provider value={chatContextValue}>
      {children}
    </ChatPanelContext.Provider>
  )
}

export default ChatContextProvider
