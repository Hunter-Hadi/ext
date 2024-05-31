import { atom, atomFamily } from 'recoil'

import {
  IConversation,
  IPaginationConversation,
} from '@/features/indexed_db/conversations/models/Conversation'
import {
  IChatMessage,
  IChatUploadFile,
} from '@/features/indexed_db/conversations/models/Message'

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

export const ClientConversationStateFamily = atomFamily<
  IConversation | null,
  string
>({
  key: 'ClientConversationStateFamily',
  default: null,
})

export const PaginationConversationsState = atom<IPaginationConversation[]>({
  key: 'PaginationConversationsState',
  default: [],
})

export const PaginationConversationMessagesStateFamily = atomFamily<
  IChatMessage[],
  string
>({
  key: 'PaginationConversationMessagesStateFamily',
  default: [],
})
