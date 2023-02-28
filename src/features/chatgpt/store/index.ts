import { atom } from 'recoil'
import Browser from 'webextension-polyfill'

export type ChatGPTClientStatusType =
  | 'loading'
  | 'success'
  | 'needAuth'
  | 'complete'

export const ChatGPTClientState = atom<{
  loaded: boolean
  status: ChatGPTClientStatusType
  port?: Browser.Runtime.Port
  aborts: Array<() => void>
}>({
  key: 'ChatGPTClientState',
  default: {
    loaded: false,
    status: 'loading',
    port: undefined,
    aborts: [],
  },
})
