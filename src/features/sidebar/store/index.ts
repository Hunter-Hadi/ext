import { atom } from 'recoil'
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

export type ISidebarConversationType = 'Chat' | 'Summary' | 'Search'
