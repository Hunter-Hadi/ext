import { Stack } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  GmailChatBox,
  InboxEditState,
  useCurrentMessageView,
} from '@/features/gmail'
import { ChatGPTLoaderWrapper } from '@/features/chatgpt'
import { useShortCutsWithMessageChat } from '@/features/shortcuts/hooks/useShortCutsWithMessageChat'
import { getChromeExtensionSettings, useDebounceValue } from '@/utils'
import { useRecoilValue } from 'recoil'
import defaultGmailToolbarContextMenuJson from '@/pages/options/defaultGmailToolbarContextMenuJson'

const GmailChatPage = () => {
  const { currentMessageId } = useCurrentMessageView()
  const { step } = useRecoilValue(InboxEditState)
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
  } = useShortCutsWithMessageChat('')
  const executeShortCuts = useCallback(async () => {
    const { gmailToolBarContextMenu } = await getChromeExtensionSettings()
    const ctaButtonAction =
      gmailToolBarContextMenu?.[0] || defaultGmailToolbarContextMenuJson[0]
    if (ctaButtonAction && ctaButtonAction?.data?.actions) {
      setShortCuts(ctaButtonAction.data.actions)
      await runShortCuts()
    }
  }, [setShortCuts, runShortCuts])
  const prefExecuteShortCuts = useRef(executeShortCuts)
  const prevIdRef = useRef<string | undefined>()
  useEffect(() => {
    prefExecuteShortCuts.current = executeShortCuts
  }, [executeShortCuts])
  const debounceCurrentMessageId = useDebounceValue(currentMessageId, 200)
  const memoizedDeps = useMemo(() => {
    const deps = [prefExecuteShortCuts.current, debounceCurrentMessageId]
    prevIdRef.current = debounceCurrentMessageId
    return deps
  }, [debounceCurrentMessageId, step])
  useEffect(() => {
    if (debounceCurrentMessageId) {
      console.log('init default input value run!')
      executeShortCuts()
    }
  }, memoizedDeps)

  return (
    <Stack flex={1} height={0} position={'relative'}>
      <ChatGPTLoaderWrapper />
      <GmailChatBox
        insertAble
        editAble={false}
        defaultValue={inputValue}
        onSendMessage={sendQuestion}
        writingMessage={conversation.writingMessage}
        messages={messages}
        loading={conversation.loading}
        title={'Chat Draft'}
        onRetry={retryMessage}
        onReGenerate={reGenerate}
        onStopGenerate={stopGenerateMessage}
      />
    </Stack>
  )
}
export default GmailChatPage
