import { atom } from 'recoil'
import * as InboxSDK from '@inboxsdk/core'
import { ComposeView } from '@inboxsdk/core'
import { IGmailChatMessage } from '@/features/gmail'

interface IProxyInboxSdkTarget<T> {
  getInstance?: () => T
}

export const InboxEditState = atom<{
  currentMessageId?: string
  currentDraftId?: string
}>({
  key: 'InboxEditState',
  default: {},
})

export const InboxSdkState = atom<{
  sdk: InboxSDK.InboxSDK | null
  loading: boolean
  initialized: boolean
}>({
  key: 'InboxSdkState',
  default: {
    sdk: null,
    loading: true,
    initialized: false,
  },
})

export const InboxThreadViewState = atom<
  IProxyInboxSdkTarget<InboxSDK.ThreadView> & { currentThreadId?: string }
>({
  key: 'InboxThreadViewState',
  default: {
    getInstance: undefined,
    currentThreadId: undefined,
  },
})

export const InboxComposeViewState = atom<{
  [key: string]: IProxyInboxSdkTarget<ComposeView>
}>({
  key: 'InboxComposeViewState',
  default: {},
})

export const GmailMessageChatState = atom<IGmailChatMessage[]>({
  key: 'GmailMessageChatState',
  default: [],
})

export const GmailMessageChatInputState = atom<string>({
  key: 'GmailMessageChatInputState',
  default: '',
})

export const GmailMessageChatConversationState = atom<{
  writingMessage: IGmailChatMessage | null
  conversationId?: ''
  lastMessageId?: string
  loading: boolean
}>({
  key: 'GmailMessageChatConversationState',
  default: {
    writingMessage: null,
    conversationId: '',
    lastMessageId: '',
    loading: false,
  },
})
