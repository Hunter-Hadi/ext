import { FC, useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'

import React from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { pingDaemonProcess } from '@/features/chatgpt/utils'
import { GoogleIcon, UseChatGptIcon } from '@/components/CustomIcon'
import { AuthState } from '@/features/auth/store'
import { AppSettingsState } from '@/store'
import { getChromeExtensionSettings } from '@/background/utils'
import { useFocus } from '@/hooks/useFocus'
import ChatGPTRefreshPageTips from '@/features/chatgpt/components/ChatGPTRefreshPageTips'
import AIProviderSelector from '@/features/chatgpt/components/AIProviderSelector'
// import { IChatGPTProviderType } from '@/background/provider/chat'

const ChatGPTStatusWrapper: FC = () => {
  const [authLogin] = useRecoilState(AuthState)
  const setAppSettings = useSetRecoilState(AppSettingsState)
  const [chatGPTClientState, setChatGPTClientState] =
    useRecoilState(ChatGPTClientState)
  const { status } = chatGPTClientState
  const [prevStatus, setPrevStatus] = useState(status)
  useEffect(() => {
    if (prevStatus !== status && status === 'success') {
      // get latest settings
      console.log('get latest settings')
      getChromeExtensionSettings().then(setAppSettings)
    }
    setPrevStatus(status)
  }, [status])

  useFocus(() => {
    console.log('gmain chatgpt onFocus')
    pingDaemonProcess().then((res) => {
      console.log('gmain chatgpt onFocus: pingDaemonProcess', res)
      // 如果没有连接上，就需要重新加载
      if (!res) {
        setChatGPTClientState((s) => ({
          ...s,
          status: 'needReload',
        }))
      }
    })
  })

  if (status === 'needReload') {
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
              bgcolor: 'background.paper',
            }}
          >
            <ChatGPTRefreshPageTips />
          </Paper>
        </Stack>
      </Box>
    )
  }

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
          position: 'absolute',
          right: 8,
          bottom: 112,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AIProviderSelector />
      </Paper>
    </Box>
  )
}

export { ChatGPTStatusWrapper }
