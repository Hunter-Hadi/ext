import Stack from '@mui/material/Stack'
import React, { useEffect } from 'react'

import { ChatGPTStatusWrapper } from '@/features/chatgpt/components/ChatGPTStatusWrapper'
import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { pingDaemonProcess } from '@/features/chatgpt/utils'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
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
          if (currentSidebarConversationType === 'Summary') {
            // 查看最后一条消息是否为总结的那一条消息
            for (
              let i = currentSidebarConversationMessages.length - 1;
              i >= 0;
              i--
            ) {
              const message = currentSidebarConversationMessages[i]
              // 查看最后一条AI消息是不是总结的那条消息
              if (isAIMessage(message)) {
                if (
                  message.originalMessage?.metadata?.shareType === 'summary'
                ) {
                  await resetConversation()
                  return
                }
                // 如果不是总结的那条消息，就不用再往前找了
                break
              }
            }
          }
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
