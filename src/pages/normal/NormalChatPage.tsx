import { useMessageWithChatGPT } from '@/features/chatgpt/hooks'
import Stack from '@mui/material/Stack'
import React, { useEffect } from 'react'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
import { ChatGPTStatusWrapper } from '@/features/chatgpt/components/ChatGPTStatusWrapper'
import { pingDaemonProcess } from '@/features/chatgpt/utils'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'

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
          await reGenerate()
        }}
        onStopGenerate={stopGenerateMessage}
        onReset={resetConversation}
      />
    </Stack>
  )
}
export default NormalChatPage
