import { atom } from 'recoil'
import { CHAT_GPT_PROVIDER } from '@/types'

export type IChatGPTProviderType =
  (typeof CHAT_GPT_PROVIDER)[keyof typeof CHAT_GPT_PROVIDER]

export type IChatGPTClientStatusType =
  | 'needAuth'
  | 'loading'
  | 'complete'
  | 'success'

export const ChatGPTClientState = atom<{
  provider?: IChatGPTProviderType
  loaded: boolean
  status: IChatGPTClientStatusType
  aborts: Array<() => void>
}>({
  key: 'ChatGPTClientState',
  default: {
    provider: undefined,
    loaded: false,
    status: 'needAuth',
    aborts: [],
  },
})
