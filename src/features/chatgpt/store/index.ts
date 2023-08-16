import { atom } from 'recoil'
import { ChatStatus } from '@/background/provider/chat'
import { IChatConversation } from '@/background/src/chatConversations'

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

export const ClientConversationMapState = atom<{
  [key: string]: IChatConversation
}>({
  key: 'ClientConversationMapState',
  default: {},
})
