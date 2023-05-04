import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import Stack from '@mui/material/Stack'
import React, { useEffect } from 'react'
import { GmailChatBox } from '@/features/gmail'
import { ChatGPTStatusWrapper } from '@/features/chatgpt/components/ChatGPTStatusWrapper'
import { pingDaemonProcess } from '@/features/chatgpt/utils'

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
    resetConversation,
  } = useMessageWithChatGPT('')
  useEffect(() => {
    pingDaemonProcess()
  }, [])
  return (
    <Stack flex={1} height={0} position={'relative'}>
      <ChatGPTStatusWrapper />
      <GmailChatBox
        editAble={false}
        insertAble={false}
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
export default NormalChatPage
