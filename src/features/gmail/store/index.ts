import { atom, selector } from 'recoil'
import * as InboxSDK from '@inboxsdk/core'
import { ComposeView } from '@inboxsdk/core'
import { IGmailChatMessage } from '@/features/gmail/components/GmailChatBox'

interface IProxyInboxSdkTarget<T> {
  getInstance?: () => T
}

export const InboxEditState = atom<{
  currentMessageId?: string
  currentDraftId?: string
  step?: number
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

export const ChatGPTMessageState = atom<IGmailChatMessage[]>({
  key: 'GmailMessageChatState',
  default: [],
})

export const ChatGPTInputState = atom<string>({
  key: 'ChatGPTInputState',
  default: '',
})

export const ChatGPTConversationState = atom<{
  writingMessage: IGmailChatMessage | null
  conversationId?: ''
  lastMessageId?: string
  model: string
  loading: boolean
}>({
  key: 'ChatGPTConversationState',
  default: {
    writingMessage: null,
    conversationId: '',
    lastMessageId: '',
    model: '',
    loading: false,
  },
})

export type IInboxMessageType = 'new-email' | 'reply'

export const CurrentInboxMessageTypeSelector = selector<IInboxMessageType>({
  key: 'CurrentInboxMessageTypeSelector',
  get: ({ get }) => {
    const currentMessageId = get(InboxEditState).currentMessageId
    if (currentMessageId?.includes('newDraft_')) {
      return 'new-email'
    } else {
      return 'reply'
    }
  },
})
