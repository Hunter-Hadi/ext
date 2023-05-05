import { atom, selector } from 'recoil'
import { ComposeView, InboxSDK, ThreadView } from '@inboxsdk/core'
import { CHAT_GPT_MESSAGES_RECOIL_KEY } from '@/types'
import Browser from 'webextension-polyfill'
import { IChatMessage } from '@/features/chatgpt/types'

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
  sdk: InboxSDK | null
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
  IProxyInboxSdkTarget<ThreadView> & { currentThreadId?: string }
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

export const ChatGPTMessageState = atom<IChatMessage[]>({
  key: CHAT_GPT_MESSAGES_RECOIL_KEY,
  default: [],
  effects: [
    ({ onSet }) => {
      onSet((newValue) => {
        if (newValue.length > 0) {
          Browser.storage.local
            .set({
              [CHAT_GPT_MESSAGES_RECOIL_KEY]: JSON.stringify(newValue),
            })
            .then(() => {
              console.log(
                '[ChatGPT Module] [localstorage] message update:\t',
                newValue,
              )
            })
        }
      })
    },
  ],
})

export const ChatGPTConversationState = atom<{
  writingMessage: IChatMessage | null
  conversationId?: string
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
