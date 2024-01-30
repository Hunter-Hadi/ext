import Stack from '@mui/material/Stack'
import React, { useEffect } from 'react'

import useArtTextToImage from '@/features/art/hooks/useArtTextToImage'
import { ChatGPTStatusWrapper } from '@/features/chatgpt/components/ChatGPTStatusWrapper'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { pingDaemonProcess } from '@/features/chatgpt/utils'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
import SidebarNav from '@/features/sidebar/components/SidebarNav'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

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
  const { clientWritingMessage, cleanConversation } = useClientConversation()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const { currentSidebarConversationMessages } = useSidebarSettings()
  const { startTextToImage } = useArtTextToImage()
  useEffect(() => {
    pingDaemonProcess()
  }, [])
  return (
    <Stack flex={1} height={0} position={'relative'} direction="row">
      <Stack flex={1} width={0}>
        {!isMaxAIImmersiveChatPage() && <ChatBoxHeader />}
        <ChatGPTStatusWrapper />
        <SidebarChatBox
          onSendMessage={async (question, options) => {
            if (currentSidebarConversationType === 'Search') {
              await createSearchWithAI(question, true)
            } else if (currentSidebarConversationType === 'Art') {
              await startTextToImage(question)
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
          writingMessage={clientWritingMessage.writingMessage}
          messages={currentSidebarConversationMessages}
          loading={smoothConversationLoading}
          onReGenerate={async () => {
            if (currentSidebarConversationType === 'Search') {
              await regenerateSearchWithAI()
              return
            }
            await regenerate()
          }}
          onStopGenerate={stopGenerate}
          onReset={cleanConversation}
        />
      </Stack>

      {!isMaxAIImmersiveChatPage() && <SidebarNav />}
    </Stack>
  )
}
export default SidebarPage
