import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import Stack from '@mui/material/Stack'
import React, { useEffect } from 'react'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
import { ChatGPTStatusWrapper } from '@/features/chatgpt/components/ChatGPTStatusWrapper'
import { pingDaemonProcess } from '@/features/chatgpt/utils'
import { useChatConversationMessages } from '@/features/chatgpt/hooks/useConversationMessages'

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
    reGenerate,
    retryMessage,
    stopGenerateMessage,
    resetConversation,
  } = useMessageWithChatGPT('')
  const messagesList = useChatConversationMessages()
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
        messages={messagesList}
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
