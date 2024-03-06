import Stack from '@mui/material/Stack'
import React, { useEffect } from 'react'

import useArtTextToImage from '@/features/art/hooks/useArtTextToImage'
import { ChatGPTStatusWrapper } from '@/features/chatgpt/components/ChatGPTStatusWrapper'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { pingDaemonProcess } from '@/features/chatgpt/utils'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
import SidebarFilesDropBox from '@/features/sidebar/components/SidebarChatBox/SidebarFilesDropBox'
import SidebarPromotionDialog from '@/features/sidebar/components/SidebarChatBox/SidebarPromotionDialog'
import SidebarTour from '@/features/sidebar/components/SidebarChatBox/SidebarTour'
import SidebarNav from '@/features/sidebar/components/SidebarNav'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarDropEvent from '@/features/sidebar/hooks/useSidebarDropEvent'
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
  const { smoothConversationLoading } = useSmoothConversationLoading(500)
  const { currentSidebarConversationMessages } = useSidebarSettings()
  const { startTextToImage } = useArtTextToImage()
  const {
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useSidebarDropEvent()
  useEffect(() => {
    pingDaemonProcess()
  }, [])
  return (
    <Stack
      flex={1}
      height={0}
      position={'relative'}
      direction="row"
      id={'MaxAISidebarContainer'}
    >
      <SidebarTour />
      <SidebarPromotionDialog />
      <Stack
        position={'relative'}
        flex={1}
        width={0}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
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

        <SidebarFilesDropBox />
      </Stack>
      {!isMaxAIImmersiveChatPage() && <SidebarNav />}
    </Stack>
  )
}
export default SidebarPage
