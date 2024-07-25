// init i18n
import '@/i18n'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'
import { useRecoilValue } from 'recoil'

import { IMMERSIVE_CHAT_PORTAL_ID } from '@/apps/immersive-chat/components/ImmersiveChatPortal'
import Announcement from '@/components/Announcement'
import AppInit from '@/components/AppInit'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import BrowserVersionDetector from '@/components/BrowserVersionDetector'
import useActivity from '@/features/auth/hooks/useActivity'
import { DailyLimitState } from '@/features/auth/store'
import ConversationList from '@/features/chatgpt/components/ConversationList'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import SidebarContextProvider from '@/features/sidebar/components/SidebarContextProvider'
import SidebarNav from '@/features/sidebar/components/SidebarNav'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { UnableSubscriptionState } from '@/features/subscription/store'
import SidebarPage from '@/pages/sidebar'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'
import SidebarTopBar from '@/pages/sidebarLayouts/SidebarTopBar'

const App: FC = () => {
  const { isShowActivityBanner } = useActivity()
  const { currentSidebarConversationType } = useSidebarSettings()
  const dailyLimitState = useRecoilValue(DailyLimitState)
  const unableSubscriptionState = useRecoilValue(UnableSubscriptionState)

  let topBarHeight = isShowActivityBanner ? 96 : 48
  if (dailyLimitState.show) {
    topBarHeight += dailyLimitState.barHeight
  }
  if (unableSubscriptionState.show) {
    topBarHeight += unableSubscriptionState.barHeight
  }

  return (
    <Box
      component={'div'}
      className={'use-chat-gpt-ai-app'}
      sx={{
        // pointerEvents: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        div: {
          userSelect: 'none',
        },
      }}
    >
      <Stack
        height={'100%'}
        sx={{
          '& *': {
            // fontSize: '14px',
            boxSizing: 'border-box',
            fontFamily: '"Roboto","Helvetica","Arial",sans-serif!important',
          },
        }}
      >
        <AppInit />
        <Announcement />
        <SidebarContextProvider>
          <SidebarTopBar />
          <ChatBoxHeader showConversationList />
          <BrowserVersionDetector>
            <AppSuspenseLoadingLayout>
              <Stack flexDirection={'row'} flex={1} height={0}>
                <Stack
                  direction={'row'}
                  borderRight={'1px'}
                  borderBottom={0}
                  borderTop={0}
                  borderLeft={0}
                  sx={{
                    left: 0,
                    position: 'fixed',
                    width: 392,
                    transform: {
                      xs: 'translateX(-100%)',
                      sm: 'translateX(0)',
                    },
                    transition: 'transform 0.3s ease-in-out',
                    borderStyle: 'solid',
                  }}
                  height={`calc(100vh - ${topBarHeight}px)`}
                  borderColor={'customColor.borderColor'}
                >
                  <SidebarNav />
                  <ConversationWithSwitcher
                    currentSidebarConversationType={
                      currentSidebarConversationType
                    }
                  />
                </Stack>

                {/* 页面左侧 ConversationList 的占位元素 */}
                <Stack
                  sx={{
                    transition: 'width 0.3s ease-in-out',
                    flexShrink: 0,
                    width: {
                      xs: 0,
                      sm: 392,
                    },
                  }}
                />

                <Stack
                  height={'100%'}
                  width={'100vw'}
                  direction={'row'}
                  alignItems={'stretch'}
                >
                  <Stack width={0} flex={1} height={'100%'}>
                    <SidebarPage open />
                  </Stack>
                  <Stack
                    id={IMMERSIVE_CHAT_PORTAL_ID}
                    width={0}
                    flex={1}
                    sx={{
                      // 如果没有children, 则不显示
                      '&:empty': {
                        display: 'none',
                      },
                    }}
                  />
                </Stack>
              </Stack>
            </AppSuspenseLoadingLayout>
          </BrowserVersionDetector>
        </SidebarContextProvider>
      </Stack>
    </Box>
  )
}

const ConversationWithSwitcher: FC<{
  currentSidebarConversationType: ISidebarConversationType
}> = ({ currentSidebarConversationType }) => {
  const { updateConversationId } = useClientConversation()
  const { updateSidebarConversationType } = useSidebarSettings()
  return (
    <ConversationList
      disableModalPortal={false}
      conversationType={currentSidebarConversationType}
      sx={{
        flex: 1,
        width: 0,
      }}
      onSelectConversation={async (conversation) => {
        switch (conversation.type) {
          case 'ContextMenu':
          case 'Chat':
          case 'Search':
          case 'Art':
            await updateConversationId(conversation.id)
            updateSidebarConversationType(conversation.type)
            break
        }
      }}
    />
  )
}

export default App
