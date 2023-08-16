import { atom, selector } from 'recoil'
import { ComposeView, InboxSDK, ThreadView } from '@inboxsdk/core'

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
