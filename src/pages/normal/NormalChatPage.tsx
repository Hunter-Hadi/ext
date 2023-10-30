import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import Stack from '@mui/material/Stack'
import React, { useEffect } from 'react'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
import { ChatGPTStatusWrapper } from '@/features/chatgpt/components/ChatGPTStatusWrapper'
import { pingDaemonProcess } from '@/features/chatgpt/utils'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'

// const getDefaultValue = () => {
//   const autoFocusInputValue = (
//     document.querySelector('input[autoFocus]') as HTMLInputElement
//   )?.value
//   return autoFocusInputValue || 'Enter ChatGPT prompt...'
// }
const NormalChatPage = () => {
  const { currentSidebarConversationType } = useSidebarSettings()
  const { createSearchWithAI, regenerateSearchWithAI } = useSearchWithAI()
  const {
    sendQuestion,
    conversation,
    reGenerate,
    retryMessage,
    stopGenerateMessage,
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
        editAble={false}
        insertAble={false}
        onSendMessage={async (question, options) => {
          if (currentSidebarConversationType === 'Search') {
            await createSearchWithAI(question, true)
          } else {
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
          }
        }}
        writingMessage={conversation.writingMessage}
        messages={currentSidebarConversationMessages}
        loading={smoothConversationLoading}
        title={'Chat Draft'}
        onRetry={retryMessage}
        onReGenerate={async () => {
          if (currentSidebarConversationType === 'Summary') {
            if (currentSidebarConversationMessages.length === 1) {
              // 只有一个消息，说明是总结的那一条消息，这个时候就可以重置conversation了
              await resetConversation()
              return
            }
          }
          if (currentSidebarConversationType === 'Search') {
            await regenerateSearchWithAI()
          } else {
            await reGenerate()
          }
        }}
        onStopGenerate={stopGenerateMessage}
        onReset={resetConversation}
      />
    </Stack>
  )
}
export default NormalChatPage
