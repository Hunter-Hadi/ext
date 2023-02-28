import React, { FC, useEffect } from 'react'
import './app.less'
import { hideEzMailBox, useInitInboxSdk } from '@/features/gmail'
import {
  IconButton,
  Link,
  Stack,
  ThemeProvider,
  Typography,
} from '@mui/material'

import {
  useInitChatGPTClient,
  useMessageWithChatGPT,
} from '@/features/chatgpt/hooks'
import GmailChatPage from '@/pages/gmail/GmailChatPage'
import CloseIcon from '@mui/icons-material/Close'
import customMuiTheme from '@/pages/customMuiTheme'
import { atom, useRecoilState, useRecoilValue } from 'recoil'
import NormalChatPage from '@/pages/normal/NormalChatPage'
import { ChatGPTClientState } from '@/features/chatgpt/store'

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
  return <>{appState.env === 'gmail' && <GmailInit />}</>
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
    if (appRef.current && appRef.current.parentElement) {
      attrObserver.observe(appRef.current.parentElement, {
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
      <ThemeProvider theme={customMuiTheme}>
        <AppInit />
        <div className={'ezmail-ai-app'} ref={appRef}>
          <Stack spacing={1} height={'100%'}>
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
            </Stack>
          </Stack>
        </div>
      </ThemeProvider>
    </>
  )
}

export default App
