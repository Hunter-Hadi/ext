import React, { FC, useEffect, useState } from 'react'
import './global.less'
import { Box, IconButton, Link, Stack, Typography } from '@mui/material'
import GmailChatPage from '@/pages/gmail/GmailChatPage'
import CloseIcon from '@mui/icons-material/Close'
import { useRecoilState } from 'recoil'
import NormalChatPage from '@/pages/normal/NormalChatPage'
import { getChromeExtensionSettings, getClientEnv, hideChatBox } from '@/utils'
import {
  CHROME_EXTENSION_HOMEPAGE_URL,
  CHROME_EXTENSION_POST_MESSAGE_ID,
  ROOT_CONTAINER_ID,
} from '@/types'
import { EzMailAIIcon, UseChatGptIcon } from '@/components/CustomIcon'
import Browser from 'webextension-polyfill'
import { AppState } from '@/store'
import AppInit from '@/utils/AppInit'

const isEzMailApp = process.env.APP_ENV === 'EZ_MAIL_AI'

const App: FC = () => {
  const appRef = React.useRef<HTMLDivElement>(null)
  const [appState, setAppState] = useRecoilState(AppState)
  // const { resetConversation } = useMessageWithChatGPT()
  const [commandKey, setCommandKey] = useState('click to setup')
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
      // resetConversation()
    }
  }, [appState])
  useEffect(() => {
    getChromeExtensionSettings()
      .then((settings) => {
        if (settings?.commands) {
          const command = settings.commands.find(
            (command) => command.name === '_execute_action',
          )
          if (command) {
            setCommandKey(command.shortcut || 'click to setup')
          }
        }
      })
      .catch()
  }, [])
  return (
    <>
      <AppInit />
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
          // position: 'absolute',
          // right: 0,
          // width: '25%',
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
            px={1}
          >
            <Link
              sx={{
                flexShrink: 0,
                textDecoration: 'none!important',
              }}
              href={CHROME_EXTENSION_HOMEPAGE_URL + '?invite=CHROME_EXTENSION'}
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
                      const port = Browser.runtime.connect()
                      port &&
                        port.postMessage({
                          id: CHROME_EXTENSION_POST_MESSAGE_ID,
                          event: 'Client_openUrlInNewTab',
                          data: {
                            url: 'chrome://extensions/shortcuts',
                          },
                        })
                      port.disconnect()
                    }}
                  >
                    Shortcut: {commandKey}
                  </Link>
                </Typography>
              )}
            </Stack>
            <IconButton
              sx={{ flexShrink: 0 }}
              onClick={() => {
                hideChatBox()
              }}
            >
              <CloseIcon sx={{ fontSize: '24px' }} />
            </IconButton>
          </Stack>
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
    </>
  )
}

export default App
