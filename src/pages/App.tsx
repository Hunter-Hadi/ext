import React, { FC, useEffect } from 'react'
import './global.less'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import GmailChatPage from '@/pages/gmail/GmailChatPage'
import CloseIcon from '@mui/icons-material/Close'
import { useRecoilState } from 'recoil'
import NormalChatPage from '@/pages/normal/NormalChatPage'
import { chromeExtensionClientOpenPage, hideChatBox } from '@/utils'
import {
  APP_USE_CHAT_GPT_HOST,
  CHROME_EXTENSION_HOMEPAGE_URL,
  isEzMailApp,
  ROOT_CONTAINER_ID,
} from '@/types'
import { EzMailAIIcon, UseChatGptIcon } from '@/components/CustomIcon'
import { AppState } from '@/store'
import AppInit from '@/utils/AppInit'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import TooltipButton from '@/components/TooltipButton'
import useCommands from '@/hooks/useCommands'

const App: FC = () => {
  const appRef = React.useRef<HTMLDivElement>(null)
  const [appState, setAppState] = useRecoilState(AppState)
  const { shortCutKey } = useCommands()
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
    if (!appState.open) {
      console.log('watch app close reset conversation')
      // resetConversation()
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
              href={
                isEzMailApp
                  ? CHROME_EXTENSION_HOMEPAGE_URL + '?invite=CHROME_EXTENSION'
                  : APP_USE_CHAT_GPT_HOST
              }
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
                  {String(process.env.APP_NAME)}
                </Typography>
                <TooltipButton
                  title={'Settings'}
                  size={'small'}
                  variant={'text'}
                  sx={{
                    width: 32,
                    height: 32,
                    color: 'inherit',
                    minWidth: 'unset',
                  }}
                  onClick={(event) => {
                    event.stopPropagation()
                    event.preventDefault()
                    chromeExtensionClientOpenPage({
                      key: 'options',
                    })
                  }}
                >
                  <SettingsOutlinedIcon
                    sx={{ fontSize: 16, color: 'text.primary' }}
                  />
                </TooltipButton>
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
                      chromeExtensionClientOpenPage({ key: 'shortcuts' })
                    }}
                  >
                    Shortcut: {shortCutKey || 'click to setup'}
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
