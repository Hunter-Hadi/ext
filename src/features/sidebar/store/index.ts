import { atom, selector } from 'recoil'
import { IChatMessage } from '@/features/chatgpt/types'
import { ClientConversationMapState } from '@/features/chatgpt/store'

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

export type ISidebarConversationType = 'Chat' | 'Summary'

export const SidebarSettingsState = atom<{
  type: ISidebarConversationType
  chatConversationId?: string
  summaryConversationId?: string
}>({
  key: 'SidebarSettingsState',
  default: {
    type: 'Chat',
  },
})

export const SidebarConversationIdSelector = selector<string>({
  key: 'SidebarConversationIdSelector',
  get: ({ get }) => {
    const sidebarSetting = get(SidebarSettingsState)
    if (sidebarSetting.type === 'Chat') {
      return sidebarSetting.chatConversationId || ''
    } else {
      return sidebarSetting.summaryConversationId || ''
    }
  },
})

/**
 * sidebar用户选择的板块的消息
 */
export const SidebarConversationMessagesSelector = selector<IChatMessage[]>({
  key: 'SidebarConversationMessagesSelector',
  get: ({ get }) => {
    const sidebarConversationId = get(SidebarConversationIdSelector)
    const conversationMap = get(ClientConversationMapState)
    return conversationMap[sidebarConversationId]?.messages || []
  },
})

/**
 * sidebar用户Chat的板块的消息
 */
export const SidebarChatConversationMessagesSelector = selector<IChatMessage[]>(
  {
    key: 'SidebarChatConversationMessagesSelector',
    get: ({ get }) => {
      const sidebarChatConversationId =
        get(SidebarSettingsState).chatConversationId
      const conversationMap = get(ClientConversationMapState)
      if (
        sidebarChatConversationId &&
        conversationMap[sidebarChatConversationId]
      ) {
        return conversationMap[sidebarChatConversationId]?.messages || []
      }
      return []
    },
  },
)
