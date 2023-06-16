import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CurrentInboxMessageTypeSelector,
  InboxEditState,
} from '@/features/gmail/store'

import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useDebounceValue } from '@/utils'
import { useRecoilValue } from 'recoil'
import {
  USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
} from '@/constants'
import { getChromeExtensionButtonContextMenu } from '@/background/utils'
import { useCurrentMessageView } from '@/features/gmail/hooks'

// FIXME: inputValue采用了中介者模式，所以这个页面的代码逻辑需要重新调整
const GmailActionRunner = () => {
  const { currentMessageId } = useCurrentMessageView()
  const { step } = useRecoilValue(InboxEditState)
  const messageType = useRecoilValue(CurrentInboxMessageTypeSelector)
  const [run, setRun] = useState(false)
  const { runShortCuts, setShortCuts } = useShortCutsWithMessageChat('')

  useEffect(() => {
    const ctaButtonAction = () => {
      setRun(true)
    }
    window.addEventListener('ctaButtonClick', ctaButtonAction)
    return () => {
      window.removeEventListener('ctaButtonClick', ctaButtonAction)
    }
  }, [])

  const executeShortCuts = useCallback(async () => {
    const gmailToolBarContextMenu = await getChromeExtensionButtonContextMenu(
      'gmailButton',
    )
    const ctaButtonAction = gmailToolBarContextMenu.find((item) =>
      messageType === 'reply'
        ? item.id === USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID
        : item.id === USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
    )
    if (ctaButtonAction && ctaButtonAction?.data?.actions) {
      setShortCuts(ctaButtonAction.data.actions)
      await runShortCuts()
    }
  }, [setShortCuts, runShortCuts, messageType])
  const prefExecuteShortCuts = useRef(executeShortCuts)
  const prevIdRef = useRef<string | undefined>()
  useEffect(() => {
    prefExecuteShortCuts.current = executeShortCuts
  }, [executeShortCuts])
  const debounceCurrentMessageId = useDebounceValue(currentMessageId, 0)
  const memoizedDeps = useMemo(() => {
    const deps = [prefExecuteShortCuts.current, debounceCurrentMessageId, run]
    prevIdRef.current = debounceCurrentMessageId
    return deps
  }, [debounceCurrentMessageId, step, run])
  useEffect(() => {
    console.log('memoizedDeps change!', memoizedDeps)
    if (debounceCurrentMessageId && run) {
      console.log('init default input value run!')
      executeShortCuts()
      setRun(false)
    }
  }, memoizedDeps)

  return <></>
}
export default GmailActionRunner
