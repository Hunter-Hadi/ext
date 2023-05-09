import React, { FC, useEffect, useState } from 'react'
import './global.less'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Resizable } from 're-resizable'

import GmailChatPage from '@/pages/gmail/GmailChatPage'
import { useRecoilState } from 'recoil'
import NormalChatPage from '@/pages/normal/NormalChatPage'
import {
  CHROME_EXTENSION_HOMEPAGE_URL,
  CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
  isEzMailApp,
  ROOT_CONTAINER_ID,
} from '@/types'
import { AppState } from '@/store'
import AppInit from '@/utils/AppInit'
import ChatBoxHeader from '@/pages/gmail/ChatBoxHeader'
import { isShowChatBox, showChatBox } from '@/utils'
import {
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils'
import useEffectOnce from '@/hooks/useEffectOnce'

const App: FC = () => {
  const appRef = React.useRef<HTMLDivElement>(null)
  const [appState, setAppState] = useRecoilState(AppState)
  const [chatBoxWidth, setChatBoxWidth] = useState(
    CHROME_EXTENSION_USER_SETTINGS_DEFAULT_CHAT_BOX_WIDTH,
  )
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
    if (isShowChatBox()) {
      showChatBox()
    }
    setChromeExtensionSettings((settings) => {
      if (settings.userSettings) {
        settings.userSettings.chatBoxWidth = chatBoxWidth
      }
      return settings
    })
  }, [chatBoxWidth])
  useEffectOnce(() => {
    getChromeExtensionSettings().then((settings) => {
      if (settings.userSettings?.chatBoxWidth) {
        setChatBoxWidth(settings.userSettings?.chatBoxWidth)
      }
    })
  })
  return (
    <>
      <Resizable
        size={{
          width: chatBoxWidth,
          height: '100%',
        }}
        enable={{
          top: false,
          right: false,
          bottom: false,
          left: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false,
        }}
        minWidth={400}
        onResizeStop={(e, direction, ref, d) => {
          setChatBoxWidth(chatBoxWidth + d.width)
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
            <Stack
              flex={1}
              height={0}
              sx={{
                overflowY: 'auto',
              }}
            >
              {appState.open && appState.env === 'gmail' && <GmailChatPage />}
              {appState.env === 'normal' && <NormalChatPage />}
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
            </Stack>
          </Stack>
        </Box>
      </Resizable>
    </>
  )
}

export default App
