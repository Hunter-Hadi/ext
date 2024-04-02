/**
 * ChatPanelContext.ts
 * @description 用在Sidebar/Context window/ImmersiveChatPage中，用于提供当前Chat面板的会话 ID
 */
import { createContext, useContext } from 'react'

import { ChatStatus, IAIProviderType } from '@/background/provider/chat'
import { ISidebarConversationType } from '@/features/sidebar/types'

export type ChatPanelCreateConversationFunction = (
  conversationType: ISidebarConversationType,
  AIProvider?: IAIProviderType,
  AIModel?: string,
) => Promise<string>

export interface ChatPanelContextValue {
  /**
   * 当前Chat面板的会话 ID
   */
  conversationId?: string
  createConversation: ChatPanelCreateConversationFunction
  resetConversation: () => Promise<void>
  chatStatus: ChatStatus
  updateChatStatus: (status: ChatStatus) => void
}

const ChatPanelContext = createContext<ChatPanelContextValue>({
  conversationId: undefined,
  createConversation: () => Promise.resolve(''),
  resetConversation: () => Promise.resolve(),
  chatStatus: 'success',
  updateChatStatus: () => {},
})

export function useChatPanelContext() {
  const context = useContext(ChatPanelContext)
  if (!context) {
    throw new Error(
      'useChatPanelContext must be used within a ChatPanelProvider',
    )
  }
  return context
}

export { ChatPanelContext }
