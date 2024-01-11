import Stack from '@mui/material/Stack'
import React, { useEffect } from 'react'

import { ChatGPTStatusWrapper } from '@/features/chatgpt/components/ChatGPTStatusWrapper'
import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { pingDaemonProcess } from '@/features/chatgpt/utils'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

// const getDefaultValue = () => {
//   const autoFocusInputValue = (
//     document.querySelector('input[autoFocus]') as HTMLInputElement
//   )?.value
//   return autoFocusInputValue || 'Enter ChatGPT prompt...'
// }
const SidebarPage = () => {
  const { currentSidebarConversationType } = useSidebarSettings()
  const { createSearchWithAI, regenerateSearchWithAI } = useSearchWithAI()
  const { askAIQuestion, regenerate, stopGenerate } = useClientChat()
  const {
    conversation,
    retryMessage,
    resetConversation,
  } = useMessageWithChatGPT('')
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const { currentSidebarConversationMessages } = useSidebarSettings()
  useEffect(() => {
    pingDaemonProcess()
  }, [])
  return (
    <Stack flex={1} height={0} position={'relative'}>
      <ChatGPTStatusWrapper />
      <SidebarChatBox
        onSendMessage={async (question, options) => {
          if (currentSidebarConversationType === 'Search') {
            await createSearchWithAI(question, true)
          } else {
            await askAIQuestion({
              type: 'user',
              text: question,
              meta: {
                ...options,
              },
            })
          }
        }}
        writingMessage={conversation.writingMessage}
        messages={currentSidebarConversationMessages}
        loading={smoothConversationLoading}
        onRetry={retryMessage}
        onReGenerate={async () => {
          if (currentSidebarConversationType === 'Search') {
            await regenerateSearchWithAI()
            return
          }
          await regenerate()
        }}
        onStopGenerate={stopGenerate}
        onReset={resetConversation}
      />
    </Stack>
  )
}
export default SidebarPage
