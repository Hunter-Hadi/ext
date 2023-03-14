import React, { FC, useEffect } from 'react'
import './app.EZ_MAIL_AI.less'
import './app.USE_CHAT_GPT.less'
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
import { hideChatBox } from '@/utils'
import { useInitRangy } from '@/features/contextMenu'
import { RangyContextMenu } from '@/features/contextMenu'
import {
  CHROME_EXTENSION_HOMEPAGE_URL,
  CHROME_EXTENSION_MAIL_TO,
  CHROME_EXTENSION_POST_MESSAGE_ID,
  ROOT_CONTAINER_ID,
} from '@/types'
import { EzMailAIIcon, UseChatGptIcon } from '@/components/CustomIcon'
const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'
const getClientEnv = () => {
  if (isEzMailApp) {
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
const RangyInit = () => {
  useInitRangy()
  return <></>
}

const AppInit = () => {
  const appState = useRecoilValue(AppState)
  useInitChatGPTClient()
  return (
    <>
      {appState.env === 'gmail' && isEzMailApp && <GmailInit />}
      {!isEzMailApp && <RangyInit />}
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
        className={isEzMailApp ? 'ezmail-ai-app' : 'use-chat-gpt-ai-app'}
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
                hideChatBox()
              }}
            >
              <CloseIcon />
            </IconButton>
            <Link
              sx={{
                flexShrink: 0,
                textDecoration: 'none!important',
              }}
              href={CHROME_EXTENSION_HOMEPAGE_URL}
              target={'_blank'}
            >
              <Stack
                direction={'row'}
                alignItems={'center'}
                gap={1}
                justifyContent={'center'}
              >
                {isEzMailApp ? (
                  <EzMailAIIcon sx={{ fontSize: 28, color: 'inherit' }} />
                ) : (
                  <UseChatGptIcon
                    sx={{
                      fontSize: 28,
                      color: 'inherit',
                    }}
                  />
                )}
                <Typography
                  color="text.primary"
                  component="h1"
                  fontSize={20}
                  fontWeight={800}
                >
                  {process.env.APP_NAME}
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
              {!isEzMailApp && (
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
                          id: CHROME_EXTENSION_POST_MESSAGE_ID,
                          event: 'Client_openUrlInNewTab',
                          data: {
                            url: 'chrome://extensions/shortcuts',
                          },
                        })
                    }}
                  >
                    Shortcut: Cmd/Alt + J
                  </Link>
                </Typography>
              )}
              <Typography fontSize={12}>
                <Link
                  color={'text.primary'}
                  sx={{ cursor: 'pointer' }}
                  underline={'always'}
                  target={'_blank'}
                  href={CHROME_EXTENSION_MAIL_TO}
                >
                  Support
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
                zIndex: -1,
                border: 0,
                opacity: 0,
              }}
              width={1}
              height={1}
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
