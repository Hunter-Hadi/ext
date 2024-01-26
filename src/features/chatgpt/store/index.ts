import { atom } from 'recoil'

import { ChatStatus } from '@/background/provider/chat'
import { IChatConversation } from '@/background/src/chatConversations'
import { IChatUploadFile } from '@/features/chatgpt/types'

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

export const ThirdPartyAIProviderConfirmDialogState = atom<{
  open: boolean
}>({
  key: 'ThirdPartyAIProviderConfirmDialogState',
  default: {
    open: false,
  },
})

export const ClientUploadedFilesState = atom<{
  blurDelay: boolean
  files: IChatUploadFile[]
}>({
  key: 'ClientUploadedFilesState',
  default: {
    files: [],
    blurDelay: false,
  },
})
