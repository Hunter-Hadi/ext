import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import { Stack } from '@mui/material'
import React from 'react'
import { GmailChatBox } from '@/features/gmail'
import { ChatGPTLoaderWrapper } from '@/features/chatgpt'

// const getDefaultValue = () => {
//   const autoFocusInputValue = (
//     document.querySelector('input[autoFocus]') as HTMLInputElement
//   )?.value
//   return autoFocusInputValue || 'Enter ChatGPT prompt...'
// }

const NormalChatPage = () => {
  const {
    sendQuestion,
    conversation,
    messages,
    reGenerate,
    retryMessage,
    inputValue,
    stopGenerateMessage,
  } = useMessageWithChatGPT('')
  return (
    <Stack flex={1} height={0} position={'relative'}>
      <ChatGPTLoaderWrapper />
      <GmailChatBox
        editAble={false}
        insertAble={false}
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
export default NormalChatPage
