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

/**
 * @description - 因为发现页面之间使用的type其实不需要完全同步，例如A页面用Chat类型，B页面用Summary类型，这其实是不用同步的，反而会增加bug
 */
export const SidebarPageState = atom<{
  sidebarConversationType: ISidebarConversationType
}>({
  key: 'SidebarPageState',
  default: {
    sidebarConversationType: 'Chat',
  },
})

export type ISidebarConversationType = 'Chat' | 'Summary' | 'Search'
