import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import Stack from '@mui/material/Stack'
import React, { useEffect } from 'react'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
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
    stopGenerateMessage,
    resetConversation,
  } = useMessageWithChatGPT('')
  useEffect(() => {
    pingDaemonProcess()
  }, [])
  return (
    <Stack flex={1} height={0} position={'relative'}>
      <ChatGPTStatusWrapper />
      <SidebarChatBox
        editAble={false}
        insertAble={false}
        onSendMessage={async (question, options) => {
          console.log('NormalChatPage onSendMessage', options)
          await sendQuestion(
            {
              question,
            },
            {
              ...options,
              regenerate: false,
              includeHistory: options.includeHistory === true,
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
