import { atom } from 'recoil'

export type ChatGPTClientStatusType =
  | 'loading'
  | 'success'
  | 'needAuth'
  | 'complete'

export const ChatGPTClientState = atom<{
  loaded: boolean
  status: ChatGPTClientStatusType
  aborts: Array<() => void>
}>({
  key: 'ChatGPTClientState',
  default: {
    loaded: false,
    status: 'loading',
    aborts: [],
  },
})
