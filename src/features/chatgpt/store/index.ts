import { atom } from 'recoil'
import { CHAT_GPT_PROVIDER } from '@/types'
import { ChatStatus } from '@/background/provider/chat'

export type IChatGPTProviderType =
  (typeof CHAT_GPT_PROVIDER)[keyof typeof CHAT_GPT_PROVIDER]

export const ChatGPTClientState = atom<{
  provider?: IChatGPTProviderType
  loaded: boolean
  status: ChatStatus
  aborts: Array<() => void>
}>({
  key: 'ChatGPTClientState',
  default: {
    provider: undefined,
    loaded: false,
    status: 'switchProvider',
    aborts: [],
  },
})
