// init i18n
import '@/i18n'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import React, { FC } from 'react'

import Announcement from '@/components/Announcement'
import AppInit from '@/components/AppInit'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import BrowserVersionDetector from '@/components/BrowserVersionDetector'
import useActivity from '@/features/auth/hooks/useActivity'
import ConversationList from '@/features/chatgpt/components/ConversationList'
import SidebarContextProvider from '@/features/sidebar/components/SidebarContextProvider'
import SidebarNav from '@/features/sidebar/components/SidebarNav'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import GlobalVideoPopup from '@/features/video_popup/components/GlobalVideoPopup'
import SidebarPage from '@/pages/sidebar'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'
import SidebarTopBar from '@/pages/sidebarLayouts/SidebarTopBar'

const App: FC = () => {
  const { isShowActivityBanner } = useActivity()
  const { currentSidebarConversationType } = useSidebarSettings()
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
                  height={`calc(100vh - ${isShowActivityBanner ? 96 : 48}px)`}
                  borderColor={'customColor.borderColor'}
                >
                  <SidebarNav />
                  <ConversationList
                    conversationType={currentSidebarConversationType}
                    sx={{
                      flex: 1,
                      width: 0,
                    }}
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

                <Stack height={'100%'} width={'100vw'}>
                  <SidebarPage open disableContextProvider />
                </Stack>
              </Stack>
            </AppSuspenseLoadingLayout>
          </BrowserVersionDetector>
        </SidebarContextProvider>
      </Stack>
      <GlobalVideoPopup />
    </Box>
  )
}

export default App
