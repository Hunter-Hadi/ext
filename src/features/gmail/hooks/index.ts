import { useRecoilValue } from 'recoil'
import {
  InboxSdkState,
  InboxComposeViewState,
  InboxEditState,
  InboxThreadViewState,
} from '@/features/gmail/store'
import { useMemo } from 'react'

export { useCurrentMessageView } from './useCurrentMessageView'

export const useInboxSdk = () => {
  const { loading, initialized, sdk } = useRecoilValue(InboxSdkState)
  return { loading, initialized, sdk }
}

export const useInboxEditValue = () => {
  const inboxEditValue = useRecoilValue(InboxEditState)
  return inboxEditValue
}

export const useInboxComposeViews = () => {
  const inboxEditValue = useInboxEditValue()
  const inboxComposeViews = useRecoilValue(InboxComposeViewState)
  const currentComposeView = useMemo(() => {
    if (inboxEditValue.currentDraftId) {
      return inboxComposeViews[inboxEditValue.currentDraftId]
    } else {
      return undefined
    }
  }, [inboxEditValue.currentDraftId])
  return {
    inboxComposeViews,
    currentComposeView,
  }
}
export const useInboxThreadView = () => {
  const inboxThreadView = useRecoilValue(InboxThreadViewState)
  return inboxThreadView
}
