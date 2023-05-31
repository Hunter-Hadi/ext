import React, { FC, useEffect } from 'react'
import './global.less'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Resizable } from 're-resizable'

import { useRecoilState } from 'recoil'
import {
  CHROME_EXTENSION_HOMEPAGE_URL,
  isEzMailApp,
  ROOT_CONTAINER_ID,
} from '@/types'
import { AppState } from '@/store'
import AppInit from '@/utils/AppInit'
import ChatBoxHeader from '@/pages/gmail/ChatBoxHeader'
import useChatBoxWidth from '@/hooks/useChatBoxWidth'
import { isShowChatBox } from '@/utils'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import BrowserVersionDetector from '@/components/BrowserVersionDetector'

const GmailChatPage = React.lazy(() => import('@/pages/gmail/GmailChatPage'))
const NormalChatPage = React.lazy(() => import('@/pages/normal/NormalChatPage'))

const App: FC = () => {
  const appRef = React.useRef<HTMLDivElement>(null)
  const { visibleWidth, maxWidth, minWidth, setLocalWidth, resizeEnable } =
    useChatBoxWidth()
  const [appState, setAppState] = useRecoilState(AppState)
  const [isOpened, setIsOpened] = React.useState(false)
  useEffect(() => {
    const attrObserver = new MutationObserver((mutations) => {
      mutations.forEach((mu) => {
        if (mu.type !== 'attributes' && mu.attributeName !== 'class') return
        setAppState((prev) => {
          return {
            ...prev,
            env: isEzMailApp ? 'gmail' : 'normal',
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
            spacing={1}
            height={'100%'}
            sx={{
              '& *': {
                // fontSize: '14px',
                boxSizing: 'border-box',
                fontFamily: `"Google Sans",Roboto,RobotoDraft,Helvetica,Arial,sans-serif`,
              },
            }}
          >
            <AppInit />
            <ChatBoxHeader />
            {isOpened && (
              <Stack flex={1} height={0}>
                <BrowserVersionDetector>
                  <AppSuspenseLoadingLayout>
                    {appState.open && appState.env === 'gmail' && (
                      <GmailChatPage />
                    )}
                    {appState.env === 'normal' && <NormalChatPage />}
                  </AppSuspenseLoadingLayout>
                  <iframe
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: -1,
                      border: 0,
                      opacity: 0,
                    }}
                    width={1}
                    height={1}
                    id={'EzMail_AI_TEMPLATE_COMPILE'}
                    src={`${CHROME_EXTENSION_HOMEPAGE_URL}/crx.html`}
                  />
                </BrowserVersionDetector>
              </Stack>
            )}
          </Stack>
        </Box>
      </Resizable>
    </>
  )
}

export default App
