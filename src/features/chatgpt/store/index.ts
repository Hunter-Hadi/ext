import { atom } from 'recoil'
import { ChatStatus } from '@/background/provider/chat'
import { IChatMessage } from '@/features/chatgpt/types'
import { ChatConversation } from '@/background/src/chatConversations'

export const ChatGPTClientState = atom<{
  loaded: boolean
  status: ChatStatus
  aborts: Array<() => void>
}>({
  key: 'ChatGPTClientState',
  default: {
    loaded: false,
    status: 'needAuth',
    aborts: [],
  },
})

export const ChatGPTMessageState = atom<IChatMessage[]>({
  key: 'ChatGPTMessageState',
  default: [],
})

export const ClientConversationMapState = atom<{
  [key: string]: ChatConversation
}>({
  key: 'ClientConversationMapState',
  default: {},
})
