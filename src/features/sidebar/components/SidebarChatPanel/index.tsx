import Typography from '@mui/material/Typography'
import React, { useEffect, useRef } from 'react'

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
import {
  isShowChatBox,
  showChatBox,
} from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { wait } from '@/utils'
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
  const { currentSidebarConversationType, updateSidebarConversationType } =
    useSidebarSettings()
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

  const createSearchWithAIRef = useRef(createSearchWithAI)
  createSearchWithAIRef.current = createSearchWithAI

  useEffect(() => {
    return OneShotCommunicator.receive(
      'QuickSearchSelectedText',
      async (data) => {
        if (!isShowChatBox()) {
          showChatBox()
        }
        if (currentSidebarConversationType !== 'Search') {
          updateSidebarConversationType('Search')
          // 下面写法主要为了修复sidebar从其他板块切到Search板块后，conversationId变了
          // 这里加一个等待，让createSearchWithAI方法拿到最新的作用域，后续重新规整后优化
          await wait(100)
        }
        await createSearchWithAIRef.current(
          data.question,
          data.includeHistory || false,
        )
      },
    )
  }, [currentSidebarConversationType])

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
