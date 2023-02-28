import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import { Stack } from '@mui/material'
import React, { useEffect, useMemo } from 'react'
import { GmailChatBox, useCurrentMessageView } from '@/features/gmail'
import AppLoadingLayout from '@/components/LoadingLayout'
import { ChatGPTLoaderWrapper } from '@/features/chatgpt'

const GmailChatPage = () => {
  const { loading, messageViewText, currentMessageId } = useCurrentMessageView()
  const defaultInputValue = useMemo(() => {
    if (!currentMessageId) {
      return null
    }
    console.log('currentMessageId', currentMessageId)
    if (currentMessageId?.startsWith('newDraft_')) {
      return 'Write an email to...'
    } else {
      if (messageViewText.trim()) {
        return `Write a reply to this email: \n\n${messageViewText}`
      } else {
        return ``
      }
    }
  }, [currentMessageId, messageViewText])
  const {
    sendQuestion,
    conversation,
    messages,
    reGenerate,
    retryMessage,
    inputValue,
    setInputValue,
    stopGenerateMessage,
  } = useMessageWithChatGPT(defaultInputValue || '')
  useEffect(() => {
    setInputValue(defaultInputValue || '')
  }, [defaultInputValue, currentMessageId])
  return (
    <Stack flex={1} height={0} position={'relative'}>
      <ChatGPTLoaderWrapper />
      <AppLoadingLayout loading={loading || defaultInputValue === null}>
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
      </AppLoadingLayout>
    </Stack>
  )
}
export default GmailChatPage
