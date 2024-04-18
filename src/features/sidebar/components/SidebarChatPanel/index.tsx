import Typography from '@mui/material/Typography'
import React, { useEffect } from 'react'

import useArtTextToImage from '@/features/art/hooks/useArtTextToImage'
import { ChatGPTStatusWrapper } from '@/features/chatgpt'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { useClientConversationListener } from '@/features/chatgpt/hooks/useClientConversationListener'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
import SidebarFilesDropBox from '@/features/sidebar/components/SidebarChatBox/SidebarFilesDropBox'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import OneShotCommunicator from '@/utils/OneShotCommunicator'
import DevContent from '@/components/DevContent'

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
  const {
    clientWritingMessage,
    clientConversationMessages,
    resetConversation,
  } = useClientConversation()
  const { smoothConversationLoading } = useSmoothConversationLoading(500)
  const { startTextToImage } = useArtTextToImage()
  useClientConversationListener()
  useEffect(() => {
    return OneShotCommunicator.receive(
      'QuickSearchSelectedText',
      async (data) => {
        await createSearchWithAI(data.question, data.includeHistory || false)
      },
    )
  }, [createSearchWithAI])
  return (
    <>
      <DevContent>
        <Test />
      </DevContent>
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
        messages={clientConversationMessages}
        loading={smoothConversationLoading}
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
      <SidebarFilesDropBox />
    </>
  )
}
export default SidebarChatPanel
