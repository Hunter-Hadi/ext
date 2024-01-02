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
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'
import SidebarTopBar from '@/pages/sidebarLayouts/SidebarTopBar'

const NormalChatPage = React.lazy(() => import('@/pages/sidebar'))
const App: FC = () => {
  const { isShowActivityBanner } = useActivity()
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
        <SidebarTopBar />
        <ChatBoxHeader showConversationList />
        <BrowserVersionDetector>
          <AppSuspenseLoadingLayout>
            <Stack flexDirection={'row'} flex={1} height={0}>
              <Stack
                borderRight={'1px'}
                borderBottom={0}
                borderTop={0}
                borderLeft={0}
                sx={{
                  left: 0,
                  position: 'fixed',
                  width: 312,
                  transform: {
                    xs: 'translateX(-100%)',
                    sm: 'translateX(0)',
                  },
                  transition: 'transform 0.3s ease-in-out',
                  borderStyle: 'solid',
                }}
                height={`calc(100vh - ${isShowActivityBanner ? 96 : 48}px)`}
                borderColor={'customColor.borderColor'}
                spacing={1}
              >
                <ConversationList />
              </Stack>
              <Stack
                sx={{
                  transition: 'width 0.3s ease-in-out',
                  flexShrink: 0,
                  width: {
                    xs: 0,
                    sm: 312,
                  },
                }}
              />
              <Stack mx={'auto'} height={'100%'} maxWidth={768} width={'100vw'}>
                <NormalChatPage />
              </Stack>
            </Stack>
          </AppSuspenseLoadingLayout>
        </BrowserVersionDetector>
      </Stack>
    </Box>
  )
}

export default App
