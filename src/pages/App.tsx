import React, { FC, useEffect } from 'react'
import './app.less'
import { useInitInboxSdk } from '@/features/gmail'
import { Box, IconButton, Link, Stack, Typography } from '@mui/material'

import {
  useInitChatGPTClient,
  useMessageWithChatGPT,
} from '@/features/chatgpt/hooks'
import GmailChatPage from '@/pages/gmail/GmailChatPage'
import CloseIcon from '@mui/icons-material/Close'
import { atom, useRecoilState, useRecoilValue } from 'recoil'
import NormalChatPage from '@/pages/normal/NormalChatPage'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { hideEzMailBox } from '@/utils'
import { useInitRangy } from '@/features/contextMenu'
import { RangyContextMenu } from '@/features/contextMenu'

const getClientEnv = () => {
  if (location.host === 'mail.google.com') {
    return 'gmail'
  }
  return 'normal'
}
export const AppState = atom<{
  env: 'gmail' | 'normal'
  open: boolean
}>({
  key: 'AppState',
  default: {
    env: getClientEnv(),
    open: false,
  },
})

const isProduction = process.env.NODE_ENV === 'production'

const GmailInit = () => {
  useInitInboxSdk()
  return (
    <>
      <style>{'.aSt {max-width: calc(100% - 700px)}'}</style>
    </>
  )
}
const AppInit = () => {
  const appState = useRecoilValue(AppState)
  useInitChatGPTClient()
  useInitRangy()
  return (
    <>
      {appState.env === 'gmail' && <GmailInit />}
      <RangyContextMenu />
    </>
  )
}

const App: FC = () => {
  const appRef = React.useRef<HTMLDivElement>(null)
  const [appState, setAppState] = useRecoilState(AppState)
  const { resetConversation } = useMessageWithChatGPT()
  const { port } = useRecoilValue(ChatGPTClientState)
  useEffect(() => {
    const attrObserver = new MutationObserver((mutations) => {
      mutations.forEach((mu) => {
        if (mu.type !== 'attributes' && mu.attributeName !== 'class') return
        setAppState({
          env: getClientEnv(),
          open:
            (mu.target as HTMLElement)?.classList?.contains('open') || false,
        })
      })
    })
    const rootEl = document.getElementById('EzMail_AI_ROOT')
    if (appRef.current && rootEl) {
      attrObserver.observe(rootEl, {
        attributes: true,
        childList: false,
      })
    }
    return () => {
      attrObserver.disconnect()
    }
  }, [appRef])
  useEffect(() => {
    if (!appState.open) {
      console.log('watch app close reset conversation')
      resetConversation()
    }
  }, [appState])
  return (
    <>
      <AppInit />
      <Box
        component={'div'}
        className={'ezmail-ai-app'}
        ref={appRef}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          borderLeft: '1px solid rgba(0, 0, 0, .1)',
        }}
      >
        <Stack
          spacing={1}
          height={'100%'}
          sx={{
            '& *': {
              fontSize: '14px',
              boxSizing: 'border-box',
              fontFamily: `"Google Sans",Roboto,RobotoDraft,Helvetica,Arial,sans-serif`,
            },
          }}
        >
          <Stack
            flexDirection={'row'}
            flexShrink={0}
            mt={1}
            height={44}
            gap={1}
            alignItems={'center'}
          >
            <IconButton
              sx={{ ml: '8px', flexShrink: 0 }}
              onClick={() => {
                hideEzMailBox()
              }}
            >
              <CloseIcon />
            </IconButton>
            <Link
              sx={{
                flexShrink: 0,
                textDecoration: 'none!important',
              }}
              href={'https://www.ezmail.ai?invite=CHROME_EXTENSION'}
              target={'_blank'}
            >
              <Stack
                direction={'row'}
                alignItems={'center'}
                gap={1}
                justifyContent={'center'}
              >
                <img
                  width={28}
                  height={28}
                  src={'https://www.ezmail.ai/ezmail_48.png'}
                />
                <Typography
                  color="text.primary"
                  component="h1"
                  fontSize={22}
                  fontWeight={800}
                >
                  EzMail.AI
                </Typography>
              </Stack>
            </Link>
            <Stack
              direction={'row'}
              flex={1}
              width={0}
              spacing={1}
              justifyContent={'end'}
              alignItems={'center'}
              px={1}
            >
              <Typography fontSize={12}>
                <Link
                  color={'text.primary'}
                  sx={{ cursor: 'pointer' }}
                  underline={'always'}
                  target={'_blank'}
                  href={'chrome://extensions/shortcuts'}
                  onClick={() => {
                    port &&
                      port.postMessage({
                        event: 'Client_openUrlInNewTab',
                        data: {
                          url: 'chrome://extensions/shortcuts',
                        },
                      })
                  }}
                >
                  Setup shortcuts
                </Link>
              </Typography>
              <Typography fontSize={12}>
                <Link
                  color={'text.primary'}
                  sx={{ cursor: 'pointer' }}
                  underline={'always'}
                  target={'_blank'}
                  href={
                    'mailto:hello@ezmail.ai?subject=I have a question about EzMail.AI Chrome extension'
                  }
                >
                  Contact us
                </Link>
              </Typography>
            </Stack>
          </Stack>
          <Stack
            flex={1}
            height={0}
            sx={{
              overflowY: 'auto',
            }}
          >
            {appState.open && appState.env === 'gmail' && <GmailChatPage />}
            {appState.open && appState.env === 'normal' && <NormalChatPage />}
            <iframe
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: isProduction ? -1 : 1,
                border: isProduction ? 0 : '1px solid red',
              }}
              width={isProduction ? 1 : 20}
              height={isProduction ? 1 : 20}
              id={'EzMail_AI_TEMPLATE_COMPILE'}
              src={'https://www.ezmail.ai/crx.html'}
            />
          </Stack>
        </Stack>
      </Box>
    </>
  )
}

export default App
