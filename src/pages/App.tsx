// init i18n
import '@/i18n'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Resizable } from 're-resizable'
import React, { FC, useEffect } from 'react'
import { useRecoilState } from 'recoil'

import Announcement from '@/components/Announcement'
import AppInit from '@/components/AppInit'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import BrowserVersionDetector from '@/components/BrowserVersionDetector'
import { MAXAI_SIDEBAR_ID } from '@/features/common/constants'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import { isShowChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import useChatBoxWidth from '@/hooks/useChatBoxWidth'
import ChatBoxHeader from '@/pages/sidebarLayouts/ChatBoxHeader'
import SidebarTopBar from '@/pages/sidebarLayouts/SidebarTopBar'
import { AppState } from '@/store'
import { getEnv } from '@/utils/AppEnv'

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
    const rootEl = document.getElementById(MAXAI_SIDEBAR_ID)
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
          className={'use-chat-gpt-ai-app'}
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
                <Stack flex={1} height={0}>
                  {isOpened && <NormalChatPage />}
                  {/*// 为了在Sidebar没有渲染的时候能执行shortcuts*/}
                  {!isOpened && (
                    <ActionSetVariablesModal modelKey={'Sidebar'} />
                  )}
                </Stack>
              </AppSuspenseLoadingLayout>
            </BrowserVersionDetector>
          </Stack>
        </Box>
      </Resizable>
    </>
  )
}

export default App
