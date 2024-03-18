import Typography from '@mui/material/Typography'
import React from 'react'

import useArtTextToImage from '@/features/art/hooks/useArtTextToImage'
import { ChatGPTStatusWrapper } from '@/features/chatgpt'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useInitClientConversationMap from '@/features/chatgpt/hooks/useInitClientConversationMap'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
import SidebarFilesDropBox from '@/features/sidebar/components/SidebarChatBox/SidebarFilesDropBox'
import useInitSidebar from '@/features/sidebar/hooks/useInitSidebar'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
const Test = () => {
  const { clientConversation } = useClientConversation()
  return (
    <Typography id={'chat-panel'} variant="h6" color={'text.primary'}>
      {clientConversation?.id}
    </Typography>
  )
}
const SidebarChatPanel = () => {
  const { currentSidebarConversationType } = useSidebarSettings()
  const { createSearchWithAI, regenerateSearchWithAI } = useSearchWithAI()
  const { askAIQuestion, regenerate, stopGenerate } = useClientChat()
  const { clientWritingMessage, cleanConversation } = useClientConversation()
  const { smoothConversationLoading } = useSmoothConversationLoading(500)
  const { currentSidebarConversationMessages } = useSidebarSettings()
  const { startTextToImage } = useArtTextToImage()
  useInitSidebar()
  useInitClientConversationMap()
  return (
    <>
      <Test />
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
    </>
  )
}
export default SidebarChatPanel
