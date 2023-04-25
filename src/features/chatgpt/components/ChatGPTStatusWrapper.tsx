import { FC, useEffect, useMemo, useState } from 'react'
import { Box, Stack, Paper, Typography, Button, Link } from '@mui/material'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { APP_USE_CHAT_GPT_HOST, CHAT_GPT_PROVIDER } from '@/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import CheckIcon from '@mui/icons-material/Check'
import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import {
  ChatGPTIcon,
  GoogleIcon,
  UseChatGptIcon,
} from '@/components/CustomIcon'
import { AuthState } from '@/features/auth/store'
import { IChatGPTProviderType } from '@/background/provider/chat'
const port = new ContentScriptConnectionV2()

const ChatGPTStatusWrapper: FC = () => {
  const [authLogin] = useRecoilState(AuthState)
  const { status } = useRecoilValue(ChatGPTClientState)
  const [showJumpToChatGPT, setShowJumpToChatGPT] = useState(false)
  useEffect(() => {
    let timer: any | null = null
    if (status === 'loading' || status === 'complete') {
      timer = setTimeout(() => {
        setShowJumpToChatGPT(true)
      }, 10000)
    }
    return () => {
      if (timer) {
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
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.1)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& + *': {
            filter: 'blur(5px)',
          },
        }}
      >
        <Paper sx={{ width: '80%', p: 2, py: 4 }}>
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
                    event: 'Client_switchChatGPTProvider',
                    data: {
                      provider: CHAT_GPT_PROVIDER.OPENAI,
                    },
                  })
                  port.destroy()
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
        </Paper>
      </Box>
    )
  }
  return <ChatGPTProviderAuthWrapper />
}

// NOTE: 这是个临时组件，后面会改界面
const ChatGPTProviderAuthWrapper: FC = () => {
  const { updateChatGPTProvider, provider } = useChatGPTProvider()
  const buttonTitle = useMemo(() => {
    if (provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS) {
      return 'Continue with UseChatGPT.AI'
    } else if (provider === CHAT_GPT_PROVIDER.OPENAI) {
      return 'Log in to ChatGPT'
    } else if (provider === CHAT_GPT_PROVIDER.OPENAI_API) {
      return 'Continue setting with ChatGPT API'
    }
    return ''
  }, [provider])

  const nextProviderText = useMemo(() => {
    if (provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS) {
      return 'continue with your own ChatGPT account'
    } else if (provider === CHAT_GPT_PROVIDER.OPENAI) {
      return 'continue with your own ChatGPT/OpenAI API Key'
    } else if (provider === CHAT_GPT_PROVIDER.OPENAI_API) {
      return 'continue with UseChatGPT.AI account'
    }
    return ''
  }, [provider])
  const switchProvider = async () => {
    let nextProvider: IChatGPTProviderType | undefined = undefined
    if (provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS) {
      nextProvider = CHAT_GPT_PROVIDER.OPENAI
    } else if (provider === CHAT_GPT_PROVIDER.OPENAI) {
      nextProvider = CHAT_GPT_PROVIDER.OPENAI_API
    } else if (provider === CHAT_GPT_PROVIDER.OPENAI_API) {
      nextProvider = CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS
    }
    if (!nextProvider) {
      return
    }
    await updateChatGPTProvider(nextProvider)
  }
  const borderRight = useMemo(() => {
    if (provider === CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS) {
      return 196
    } else if (provider === CHAT_GPT_PROVIDER.OPENAI) {
      return 98
    } else {
      return 1
    }
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
                    UseChatGPT.AI
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
                  <ChatGPTIcon sx={{ mx: 1, fontSize: 20 }} />
                  <Typography
                    fontSize={'20px'}
                    fontWeight={700}
                    color={'text.primary'}
                  >
                    ChatGPT API
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
            <Typography
              fontWeight={500}
              fontSize={'14px'}
              color={'text.secondary'}
            >
              Or{' '}
              <Typography
                fontWeight={500}
                component={'span'}
                fontSize={'inherit'}
                color={'inherit'}
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                onClick={switchProvider}
              >
                {nextProviderText}
              </Typography>
            </Typography>
          </Stack>
        </Paper>
        <Stack
          sx={{
            width: '100%',
            borderRadius: '4px',
            position: 'relative',
            mx: 'auto!important',
            maxWidth: 384,
          }}
        >
          <Stack
            direction={'row'}
            alignItems={'center'}
            sx={{
              minHeight: 36,
              borderRadius: '4px 4px 0 0',
              borderBottom: '1px solid',
              borderColor: 'customColor.borderColor',
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(61, 61, 61, 1)'
                  : 'rgba(235, 235, 235, 1)',
            }}
          >
            <Typography
              component={'div'}
              fontSize={'14px'}
              px={0.5}
              color={'text.primary'}
              width={0}
              flex={1}
            ></Typography>
            <Typography
              component={'div'}
              width={'98px'}
              flexShrink={0}
              fontSize={'12px'}
              textAlign={'center'}
              fontWeight={500}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              UseChatGPT.AI
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'12px'}
              textAlign={'center'}
              color={'text.secondary'}
              fontWeight={500}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              ChatGPT
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'12px'}
              textAlign={'center'}
              color={'text.secondary'}
              fontWeight={500}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              ChatGPT API
            </Typography>
          </Stack>
          <Stack
            direction={'row'}
            alignItems={'center'}
            sx={{
              minHeight: 36,
              borderBottom: '1px solid',
              borderColor: 'customColor.borderColor',
            }}
            bgcolor={'background.paper'}
          >
            <Typography
              component={'div'}
              fontSize={'14px'}
              color={'text.primary'}
              width={0}
              flex={1}
              textAlign={'left'}
              sx={{ textIndent: '4px' }}
            >
              No OpenAI account required
            </Typography>
            <Typography
              component={'div'}
              width={'98px'}
              flexShrink={0}
              fontSize={'14px'}
              textAlign={'center'}
              fontWeight={500}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <CheckIcon sx={{ fontSize: 20, color: '#34A853' }} />
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              -
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              -
            </Typography>
          </Stack>
          <Stack
            direction={'row'}
            sx={{
              minHeight: 36,
              borderBottom: '1px solid',
              borderColor: 'customColor.borderColor',
            }}
            alignItems={'center'}
            bgcolor={'background.paper'}
          >
            <Typography
              component={'div'}
              textAlign={'left'}
              fontSize={'14px'}
              color={'text.primary'}
              width={0}
              sx={{ textIndent: '4px' }}
              flex={1}
            >
              No OpenAl interruptions
            </Typography>
            <Typography
              component={'div'}
              width={'98px'}
              flexShrink={0}
              fontSize={'14px'}
              textAlign={'center'}
              fontWeight={500}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <CheckIcon sx={{ fontSize: 20, color: '#34A853' }} />
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              -
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              -
            </Typography>
          </Stack>
          <Stack
            sx={{
              minHeight: 36,
              borderBottom: '1px solid',
              borderColor: 'customColor.borderColor',
            }}
            direction={'row'}
            alignItems={'center'}
            bgcolor={'background.paper'}
          >
            <Typography
              component={'div'}
              textAlign={'left'}
              fontSize={'14px'}
              color={'text.primary'}
              width={0}
              sx={{ textIndent: '4px' }}
              flex={1}
            >
              Availability
            </Typography>
            <Typography
              component={'div'}
              width={'98px'}
              flexShrink={0}
              fontSize={'14px'}
              textAlign={'center'}
              fontWeight={500}
              color={'text.primary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              Always
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              Sometimes
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              Sometimes
            </Typography>
          </Stack>
          <Stack
            direction={'row'}
            sx={{
              minHeight: 36,
              borderBottom: '1px solid',
              borderColor: 'customColor.borderColor',
            }}
            alignItems={'center'}
            bgcolor={'background.paper'}
          >
            <Typography
              component={'div'}
              textAlign={'left'}
              fontSize={'14px'}
              color={'text.primary'}
              width={0}
              sx={{ textIndent: '4px' }}
              flex={1}
            >
              Response speed
            </Typography>
            <Typography
              component={'div'}
              width={'98px'}
              flexShrink={0}
              fontSize={'14px'}
              textAlign={'center'}
              fontWeight={500}
              color={'text.primary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              Fast
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              Standard
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              Standard
            </Typography>
          </Stack>
          <Stack
            direction={'row'}
            alignItems={'center'}
            bgcolor={'background.paper'}
            sx={{
              minHeight: 36,
              borderRadius: '0 0 4px 4px',
            }}
          >
            <Typography
              component={'div'}
              textAlign={'left'}
              fontSize={'14px'}
              color={'text.primary'}
              width={0}
              sx={{ textIndent: '4px' }}
              flex={1}
            >
              No country restrictions
            </Typography>
            <Typography
              component={'div'}
              width={'98px'}
              flexShrink={0}
              fontSize={'14px'}
              textAlign={'center'}
              fontWeight={500}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <CheckIcon sx={{ fontSize: 20, color: '#34A853' }} />
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              -
            </Typography>
            <Typography
              flexShrink={0}
              component={'div'}
              width={'98px'}
              fontSize={'14px'}
              fontWeight={500}
              textAlign={'center'}
              color={'text.secondary'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              -
            </Typography>
          </Stack>
          {/*// move border*/}
          <Box
            sx={{
              position: 'absolute',
              width: '98px',
              height: 'calc(100% - 2px)',
              borderRadius: '4px',
              border: '2px solid',
              top: 1,
              right: borderRight,
              transition: 'right 0.3s',
              background: (t) =>
                t.palette.mode === 'dark'
                  ? 'linear-gradient(0deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))'
                  : 'linear-gradient(0deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))',
              borderColor: (t) =>
                t.palette.mode === 'dark' ? '#fff' : '#7601D3',
            }}
          />
          {/*// arrow delta*/}
          <Box
            sx={{
              width: 0,
              height: 0,
              borderStyle: 'solid',
              border: '6px solid transparent',
              borderBottom: '6px solid',
              borderBottomColor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(61, 61, 61, 1)'
                  : 'rgba(235, 235, 235, 1)',
              position: 'absolute',
              top: -12,
              left: 'calc(50% - 6px)',
            }}
          />
        </Stack>
      </Stack>
    </Box>
  )
}
export { ChatGPTStatusWrapper }
