import Typography from '@mui/material/Typography'
import React, { useEffect } from 'react'

import DevContent from '@/components/DevContent'
import useArtTextToImage from '@/features/art/hooks/useArtTextToImage'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
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
  const { userInfo, isFreeUser } = useUserInfo()
  const { currentSidebarConversationType } = useSidebarSettings()
  const { createSearchWithAI, regenerateSearchWithAI } = useSearchWithAI()
  const { askAIQuestion, regenerate, stopGenerate } = useClientChat()
  const {
    currentConversationId,
    clientWritingMessage,
    clientConversationMessages,
    resetConversation,
    pushPricingHookMessage,
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

  return (
    <>
      <DevContent>
        <Test />
      </DevContent>
      <ChatGPTStatusWrapper />
      <SidebarChatBox
        conversationId={currentConversationId}
        conversationType={currentSidebarConversationType}
        onSendMessage={async (question, options) => {
          if (currentSidebarConversationType === 'Search') {
            await createSearchWithAI(question, true)
          } else if (currentSidebarConversationType === 'Art') {
            await startTextToImage(question)
          } else if (
            currentSidebarConversationType === 'Summary' &&
            isFreeUser &&
            userInfo?.role?.name !== 'free_trial'
          ) {
            // free_trial用户summary chat的时候不卡
            await pushPricingHookMessage('PAGE_SUMMARY')
            authEmitPricingHooksLog('show', 'PAGE_SUMMARY', {
              conversationId: currentConversationId,
              paywallType: 'RESPONSE',
            })
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
        onReset={async () => {
          if (currentSidebarConversationType === 'Summary') {
            await stopGenerate()
          }
          await resetConversation()
        }}
      />
      <SidebarFilesDropBox />
    </>
  )
}
export default SidebarChatPanel
