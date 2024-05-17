import { atom, atomFamily } from 'recoil'

import {
  IConversation,
  IPaginationConversation,
} from '@/features/indexed_db/conversations/models/Conversation'
import {
  IChatMessage,
  IChatUploadFile,
} from '@/features/indexed_db/conversations/models/Message'
import { ISidebarConversationType } from '@/features/sidebar/types'

export const ClientConversationMapState = atom<{
  [key: string]: IConversation
}>({
  key: 'ClientConversationMapState',
  default: {},
})
export const ClientConversationMessageMapState = atom<{
  [key: string]: IChatMessage[]
}>({
  key: 'ClientConversationMessageMapState',
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

export type PaginationConversationsFilterType = {
  type: ISidebarConversationType
  page_size: number
  page: number
  isDelete: boolean
  total_page: number
}

export const PaginationConversationsFilterState =
  atom<PaginationConversationsFilterType>({
    key: 'PaginationConversationsFilterState',
    default: {
      type: 'Chat',
      page_size: 50,
      page: 0,
      isDelete: false,
      total_page: 0,
    },
  })

export const PaginationConversationsState = atom<IPaginationConversation[]>({
  key: 'PaginationConversationsState',
  default: [],
})
