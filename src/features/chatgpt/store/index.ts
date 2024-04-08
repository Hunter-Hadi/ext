import { atom, atomFamily } from 'recoil'

import {
  IChatConversation,
  PaginationConversation,
} from '@/background/src/chatConversations'
import { IChatUploadFile } from '@/features/chatgpt/types'

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

export const ClientUploadedFilesState = atomFamily<
  {
    blurDelay: boolean
    files: IChatUploadFile[]
  },
  string
>({
  key: 'ClientUploadedFilesState',
  default: {
    files: [],
    blurDelay: false,
  },
})

export const PaginationConversationsState = atom<PaginationConversation[]>({
  key: 'PaginationConversationsState',
  default: [],
})
