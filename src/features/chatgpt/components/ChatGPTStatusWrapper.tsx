import { FC, useEffect, useMemo, useState } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'

import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { APP_USE_CHAT_GPT_HOST, CHAT_GPT_PROVIDER } from '@/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import {
  BardIcon,
  ChatGPTIcon,
  GoogleIcon,
  OpenAIIcon,
  UseChatGptIcon,
} from '@/components/CustomIcon'
import { AuthState } from '@/features/auth/store'
import { ChatGPTAIProviderSelector } from '@/features/chatgpt/components/ChatGPTAIProviderSelector'
import { chromeExtensionClientOpenPage } from '@/utils'
// import { IChatGPTProviderType } from '@/background/provider/chat'
const port = new ContentScriptConnectionV2()

const ChatGPTStatusWrapper: FC = () => {
  const [authLogin] = useRecoilState(AuthState)
  const { status } = useRecoilValue(ChatGPTClientState)
  const [showJumpToChatGPT, setShowJumpToChatGPT] = useState(false)
  const { provider } = useChatGPTProvider()
  useEffect(() => {
    let timer: any | null = null
    if (status === 'loading' || status === 'complete') {
      timer = setTimeout(() => {
        setShowJumpToChatGPT(true)
      }, 10000)
    }
    return () => {
      if (timer) {
        setShowJumpToChatGPT(false)
        clearTimeout(timer)
      }
    }
  }, [status])
  if (!authLogin.isLogin) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& + *': {
            filter: 'blur(5px)',
          },
        }}
      >
        <Stack spacing={2} width={'calc(100% - 16px)'}>
          <Paper
            sx={{
              maxWidth: '414px',
              mx: 'auto!important',
              width: '100%',
              p: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Stack alignItems={'flex-start'} height={'100%'} spacing={2}>
              <Stack
                direction={'row'}
                alignItems={'center'}
                justifyContent={'center'}
                width={'100%'}
                spacing={1}
              >
                <UseChatGptIcon sx={{ fontSize: 20 }} />
                <Typography
                  fontSize={'20px'}
                  fontWeight={700}
                  color={'text.primary'}
                  textAlign={'center'}
                >
                  Please sign in to continue
                </Typography>
              </Stack>
              <Link
                href={APP_USE_CHAT_GPT_HOST + '/login?auto=true'}
                target={'_blank'}
                sx={{ width: '100%' }}
              >
                <Button
                  fullWidth
                  startIcon={<GoogleIcon />}
                  disableElevation
                  variant={'outlined'}
                  sx={{
                    height: 40,
                    borderColor: 'customColor.borderColor',
                    color: 'text.secondary',
                    textIndent: '16px',
                    fontSize: 14,
                    '&:hover': {
                      color: 'text.primary',
                    },
                  }}
                >
                  Sign in with Google
                </Button>
              </Link>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    )
  }
  if (status === 'success') {
    return null
  }
  if (status === 'loading' || status === 'complete') {
    if (provider !== CHAT_GPT_PROVIDER.OPENAI) {
      // NOTE: 其他两个模型暂时没有loading
      return null
    }
    return (
      <ChatGPTSelectProviderWrapper>
        <Stack alignItems={'center'} height={'100%'} spacing={2}>
          <Typography fontSize={'20px'} fontWeight={700}>
            Connecting to ChatGPT...
          </Typography>
          {showJumpToChatGPT && (
            <Box
              sx={{
                cursor: 'pointer',
                textAlign: 'center',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
              onClick={() => {
                port.postMessage({
                  event: 'Client_authChatGPTProvider',
                  data: {
                    provider: CHAT_GPT_PROVIDER.OPENAI,
                  },
                })
              }}
            >
              <Typography
                component={'span'}
                textAlign={'center'}
                fontSize={'14px'}
                fontWeight={400}
              >
                {`If connection takes more than 10 seconds, check your `}
              </Typography>
              <Typography
                component={'span'}
                textAlign={'center'}
                fontSize={'14px'}
                fontWeight={400}
              >
                {'ChatGPT page '}
              </Typography>
              <OpenInNewIcon
                sx={{ fontSize: 14, position: 'relative', top: 3 }}
              />
              <Typography
                component={'span'}
                textAlign={'center'}
                fontSize={'14px'}
                fontWeight={400}
              >
                {' for issues.'}
              </Typography>
            </Box>
          )}
        </Stack>
      </ChatGPTSelectProviderWrapper>
    )
  }
  return <ChatGPTProviderAuthWrapper />
}

const ChatGPTSelectProviderWrapper: FC<{
  children?: React.ReactNode
}> = (props) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        '& + *': {
          filter: 'blur(5px)',
        },
      }}
    >
      <Paper
        sx={{
          mx: 'auto',
          maxWidth: '414px',
          width: 'calc(100% - 16px)',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content',
          py: 1,
          mt: 2,
        }}
      >
        <ChatGPTAIProviderSelector />
        {props.children}
      </Paper>
    </Box>
  )
}

// NOTE: 这是个临时组件，后面会改界面
const ChatGPTProviderAuthWrapper: FC = () => {
  const { provider } = useChatGPTProvider()
  const buttonTitle = useMemo(() => {
    if (provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS) {
      return 'Continue with Free AI'
    } else if (provider === CHAT_GPT_PROVIDER.OPENAI) {
      return 'Log into your own ChatGPT'
    } else if (provider === CHAT_GPT_PROVIDER.OPENAI_API) {
      return 'Add your own OpenAI API key'
    } else if (provider === CHAT_GPT_PROVIDER.BARD) {
      return 'Log into your own Google Bard'
    } else if (provider === CHAT_GPT_PROVIDER.BING) {
      return 'Log into your own Microsoft Bing'
    }
    return ''
  }, [provider])
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        '& + *': {
          filter: 'blur(5px)',
        },
      }}
    >
      <Paper
        sx={{
          mx: 'auto',
          maxWidth: '414px',
          width: 'calc(100% - 16px)',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          height: 'fit-content',
          py: 1,
          mt: 2,
        }}
      >
        <ChatGPTAIProviderSelector />
        <Stack px={1} alignItems={'flex-start'} height={'100%'} spacing={2}>
          <Stack direction={'row'} alignItems={'center'}>
            <Typography
              fontSize={'20px'}
              fontWeight={700}
              color={'text.primary'}
            >
              AI provider:
            </Typography>
            {provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS && (
              <>
                <UseChatGptIcon
                  sx={{
                    fontSize: 20,
                    mx: 1,
                    borderRadius: '4px',
                    bgcolor: (t) =>
                      t.palette.mode === 'light'
                        ? 'transparent'
                        : 'rgba(235, 235, 235, 1)',
                    p: '2px',
                  }}
                />
                <Typography
                  fontSize={'20px'}
                  fontWeight={700}
                  color={'text.primary'}
                >
                  Free AI
                </Typography>
              </>
            )}
            {provider === CHAT_GPT_PROVIDER.OPENAI && (
              <>
                <ChatGPTIcon sx={{ mx: 1, fontSize: 20 }} />
                <Typography
                  fontSize={'20px'}
                  fontWeight={700}
                  color={'text.primary'}
                >
                  ChatGPT
                </Typography>
              </>
            )}
            {provider === CHAT_GPT_PROVIDER.OPENAI_API && (
              <>
                <OpenAIIcon
                  sx={{
                    mx: 1,
                    fontSize: 20,
                    color: (t) =>
                      t.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,1)',
                  }}
                />
                <Typography
                  fontSize={'20px'}
                  fontWeight={700}
                  color={'text.primary'}
                >
                  OpenAI API
                </Typography>
              </>
            )}
            {provider === CHAT_GPT_PROVIDER.BARD && (
              <>
                <BardIcon
                  sx={{
                    mx: 1,
                    fontSize: 20,
                  }}
                />
                <Typography
                  fontSize={'20px'}
                  fontWeight={700}
                  color={'text.primary'}
                >
                  Bard
                </Typography>
              </>
            )}
          </Stack>
          <Button
            onClick={async () => {
              await port.postMessage({
                event: 'Client_authChatGPTProvider',
                data: {
                  provider,
                },
              })
            }}
            variant={'contained'}
            disableElevation
            fullWidth
            endIcon={
              provider !== CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS && (
                <OpenInNewIcon />
              )
            }
          >
            {buttonTitle}
          </Button>
          {provider === CHAT_GPT_PROVIDER.OPENAI && (
            <Alert severity={'info'}>
              <Box sx={{ display: 'inline' }}>
                <Typography
                  component={'span'}
                  fontSize={14}
                  color={'text.primary'}
                  textAlign={'left'}
                >
                  {`Log into ChatGPT and pass Cloudflare check. We recommend enabling
              our new `}
                </Typography>
                <Link
                  fontSize={14}
                  color={'primary.main'}
                  href={'#'}
                  onClick={async () => {
                    await chromeExtensionClientOpenPage({
                      key: 'options',
                      query: '#chatgpt-stable-mode',
                    })
                  }}
                >
                  ChatGPT Stable Mode
                </Link>
                <Typography
                  component={'span'}
                  fontSize={14}
                  color={'text.primary'}
                  textAlign={'left'}
                >
                  {` to avoid frequent interruptions and network
              errors.`}
                </Typography>
              </Box>
            </Alert>
          )}
        </Stack>
      </Paper>
    </Box>
  )
}
export { ChatGPTStatusWrapper }
