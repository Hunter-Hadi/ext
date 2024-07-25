import Typography from '@mui/material/Typography'
import React, { useEffect } from 'react'

import DevContent from '@/components/DevContent'
import useArtTextToImage from '@/features/art/hooks/useArtTextToImage'
import { ChatGPTStatusWrapper } from '@/features/chatgpt'
import { ArtifactsRoot } from '@/features/chatgpt/components/artifacts'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { useClientConversationListener } from '@/features/chatgpt/hooks/useClientConversationListener'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { IUserChatMessageExtraType } from '@/features/indexed_db/conversations/models/Message'
import SidebarChatBox from '@/features/sidebar/components/SidebarChatBox'
import SidebarFilesDropBox from '@/features/sidebar/components/SidebarChatBox/SidebarFilesDropBox'
import useSearchWithAI from '@/features/sidebar/hooks/useSearchWithAI'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

const Test = () => {
  const { clientConversation } = useClientConversation()
  return (
    <>
      <Typography id={'chat-panel'} color={'text.primary'} fontSize={'16px'}>
        {clientConversation?.id}
      </Typography>

      <Typography
        id={'auto-archive'}
        color={'text.primary'}
        fontSize={'14px'}
      ></Typography>
    </>
  )
}

const SidebarChatPanel = () => {
  const { currentSidebarConversationType } = useSidebarSettings()
  const { createSearchWithAI, regenerateSearchWithAI } = useSearchWithAI()
  const { askAIQuestion, regenerate, stopGenerate } = useClientChat()
  const {
    currentConversationId,
    clientWritingMessage,
    clientConversationMessages,
    resetConversation,
    clientConversation,
  } = useClientConversation()

  const { smoothConversationLoading } = useSmoothConversationLoading(500)
  const { startTextToImage } = useArtTextToImage()

  useEffect(() => {
    return OneShotCommunicator.receive(
      'QuickSearchSelectedText',
      async (data) => {
        await createSearchWithAI(data.question, data.includeHistory || false)
      },
    )
  }, [createSearchWithAI])

  useClientConversationListener()

  const sendMessage = async (
    question: string,
    options: IUserChatMessageExtraType,
  ) => {
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
  }

  return (
    <>
      <DevContent>
        <Test />
      </DevContent>
      <ChatGPTStatusWrapper />
      <SidebarChatBox
        conversationId={currentConversationId}
        conversationType={currentSidebarConversationType}
        onSendMessage={sendMessage}
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
        onReset={async () => {
          if (currentSidebarConversationType === 'Summary') {
            await stopGenerate()
          }
          await resetConversation()
        }}
        switching={
          (clientConversation || false) &&
          clientConversation.type !== currentSidebarConversationType
        }
      />
      <ArtifactsRoot />
      <SidebarFilesDropBox />
    </>
  )
}
export default SidebarChatPanel
