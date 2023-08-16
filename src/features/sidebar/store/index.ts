import { atom, selector } from 'recoil'
import { IChatMessage } from '@/features/chatgpt/types'

export const ChatGPTConversationState = atom<{
  writingMessage: IChatMessage | null
  lastMessageId?: string
  model: string
  loading: boolean
}>({
  key: 'ChatGPTConversationState',
  default: {
    writingMessage: null,
    lastMessageId: '',
    model: '',
    loading: false,
  },
})

export type ISidebarChatType = 'Chat' | 'Summary'

export const SidebarChatState = atom<{
  type: ISidebarChatType
  chatConversationId?: string
  summaryConversationId?: string
}>({
  key: 'SidebarChatState',
  default: {
    type: 'Chat',
  },
})

export const SidebarConversationIdSelector = selector<string>({
  key: 'SidebarConversationIdSelector',
  get: ({ get }) => {
    const sidebarChat = get(SidebarChatState)
    if (sidebarChat.type === 'Chat') {
      return sidebarChat.chatConversationId || ''
    } else {
      return sidebarChat.summaryConversationId || ''
    }
  },
})
