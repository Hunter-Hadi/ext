import { Stack } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CurrentInboxMessageTypeSelector,
  GmailChatBox,
  InboxEditState,
  useCurrentMessageView,
} from '@/features/gmail'
import { ChatGPTStatusWrapper } from '@/features/chatgpt'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { useDebounceValue } from '@/utils'
import { useRecoilValue } from 'recoil'
import {
  EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  EZMAIL_REPLY_CTA_BUTTON_ID,
} from '@/types'
import { getChromeExtensionContextMenu } from '@/background/utils'

const GmailChatPage = () => {
  const { currentMessageId } = useCurrentMessageView()
  const { step } = useRecoilValue(InboxEditState)
  const messageType = useRecoilValue(CurrentInboxMessageTypeSelector)
  const [run, setRun] = useState(false)
  const {
    runShortCuts,
    sendQuestion,
    conversation,
    messages,
    reGenerate,
    retryMessage,
    inputValue,
    setShortCuts,
    stopGenerateMessage,
    resetConversation,
  } = useShortCutsWithMessageChat('')

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
    const gmailToolBarContextMenu = await getChromeExtensionContextMenu(
      'gmailToolBarContextMenu',
    )
    const ctaButtonAction = gmailToolBarContextMenu.find((item) =>
      messageType === 'reply'
        ? item.id === EZMAIL_REPLY_CTA_BUTTON_ID
        : item.id === EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
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

  return (
    <Stack flex={1} height={0} position={'relative'}>
      <ChatGPTStatusWrapper />
      <GmailChatBox
        insertAble
        editAble={false}
        defaultValue={inputValue}
        onSendMessage={async (question) => {
          await sendQuestion(
            {
              question,
            },
            {
              regenerate: false,
              includeHistory: true,
            },
          )
        }}
        writingMessage={conversation.writingMessage}
        messages={messages}
        loading={conversation.loading}
        title={'Chat Draft'}
        onRetry={retryMessage}
        onReGenerate={reGenerate}
        onStopGenerate={stopGenerateMessage}
        onReset={resetConversation}
      />
    </Stack>
  )
}
export default GmailChatPage
