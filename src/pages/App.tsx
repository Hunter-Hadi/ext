import React, { FC, useEffect } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Resizable } from 're-resizable'
import { useRecoilState } from 'recoil'
import { isEzMailApp, ROOT_CONTAINER_ID } from '@/constants'
import { AppState } from '@/store'
import AppInit from '@/components/AppInit'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'
import useChatBoxWidth from '@/hooks/useChatBoxWidth'
import { isShowChatBox } from '@/utils'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import BrowserVersionDetector from '@/components/BrowserVersionDetector'
import { getEnv } from '@/utils/AppEnv'
import Announcement from '@/components/Announcement'
import GAPageLoader from '@/pages/sidebarLayouts/GAPageLoader'
// init i18n
import '@/i18n'
import SidebarTopBar from '@/pages/sidebarLayouts/SidebarTopBar'

const NormalChatPage = React.lazy(() => import('@/pages/normal/NormalChatPage'))
const App: FC = () => {
  const appRef = React.useRef<HTMLDivElement>(null)
  const {
    visibleWidth,
    maxWidth,
    minWidth,
    setLocalWidth,
    resizeEnable,
  } = useChatBoxWidth()
  const [appState, setAppState] = useRecoilState(AppState)
  const [isOpened, setIsOpened] = React.useState(false)
  useEffect(() => {
    const attrObserver = new MutationObserver((mutations) => {
      mutations.forEach((mu) => {
        if (mu.type !== 'attributes' && mu.attributeName !== 'class') return
        setAppState((prev) => {
          return {
            ...prev,
            env: getEnv(),
            open:
              (mu.target as HTMLElement)?.classList?.contains('open') || false,
          }
        })
      })
    })
    const rootEl = document.getElementById(ROOT_CONTAINER_ID)
    if (rootEl) {
      attrObserver.observe(rootEl, {
        attributes: true,
        childList: false,
      })
    }
    return () => {
      attrObserver.disconnect()
    }
  }, [])
  useEffect(() => {
    if (appState.open) {
      setIsOpened(true)
    }
  }, [appState.open])
  useEffect(() => {
    if (!isOpened) {
      const timer = setInterval(() => {
        if (isShowChatBox()) {
          setIsOpened(true)
        }
      }, 1000)
      return () => {
        clearInterval(timer)
      }
    }
    return () => {
      // do nothing
    }
  }, [isOpened])
  return (
    <>
      <Resizable
        size={{
          width: visibleWidth,
          height: '100%',
        }}
        enable={resizeEnable}
        maxWidth={maxWidth}
        minWidth={minWidth}
        onResizeStop={async (e, direction, ref, d) => {
          await setLocalWidth(visibleWidth + d.width)
        }}
      >
        <Box
          component={'div'}
          className={isEzMailApp ? 'ezmail-ai-app' : 'use-chat-gpt-ai-app'}
          ref={appRef}
          sx={{
            // pointerEvents: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            borderLeft: '1px solid rgba(0, 0, 0, .1)',
            bgcolor: 'background.paper',
            // position: 'absolute',
            // right: 0,
            // width: '25%',
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
            <ChatBoxHeader />
            <BrowserVersionDetector>
              <AppSuspenseLoadingLayout>
                {isOpened && (
                  <Stack flex={1} height={0}>
                    <NormalChatPage />
                  </Stack>
                )}
                <GAPageLoader />
              </AppSuspenseLoadingLayout>
            </BrowserVersionDetector>
          </Stack>
        </Box>
      </Resizable>
    </>
  )
}

export default App
