import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FC, useEffect, useMemo, useState } from 'react'
import React from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import getLiteChromeExtensionDBStorage from '@/background/utils/chromeExtensionStorage/getLiteChromeExtensionDBStorage'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { GoogleIcon, UseChatGptIcon } from '@/components/CustomIcon'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { AuthState } from '@/features/auth/store'
import AIProviderSelectorCard from '@/features/chatgpt/components/AIProviderSelectorCard'
import AIProviderIcon from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import ThirdPartAIProviderConfirmDialog from '@/features/chatgpt/components/AIProviderSelectorCard/ThirdPartAIProviderConfirmDialog'
import ChatGPTRefreshPageTips from '@/features/chatgpt/components/ChatGPTRefreshPageTips'
import {
  ChatGPTClientState,
  ThirdPartAIProviderConfirmDialogState,
} from '@/features/chatgpt/store'
import { pingDaemonProcess } from '@/features/chatgpt/utils'
import { useFocus } from '@/features/common/hooks/useFocus'
import { AppDBStorageState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
// import { IChatGPTProviderType } from '@/background/provider/chat'

const ChatGPTStatusWrapper: FC = () => {
  const [authLogin] = useRecoilState(AuthState)
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const [chatGPTClientState, setChatGPTClientState] = useRecoilState(
    ChatGPTClientState,
  )
  const { status } = chatGPTClientState
  const [prevStatus, setPrevStatus] = useState(status)

  const { open: providerConfirmDialogOpen } = useRecoilValue(
    ThirdPartAIProviderConfirmDialogState,
  )

  useEffect(() => {
    if (prevStatus !== status && status === 'success') {
      // get latest settings
      console.log('get latest settings')
      getLiteChromeExtensionDBStorage().then(setAppDBStorage)
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
  const memoMaskSx = useMemo(() => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isMaxAIImmersiveChatPage() ? 'unset' : 'rgba(0,0,0,0.5)',
      zIndex: 2147483631,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      '& + *': {
        filter: 'blur(5px)',
      },
    }
  }, [])
  const memoImmersiveChatMask = useMemo(() => {
    if (isMaxAIImmersiveChatPage()) {
      return (
        <Box
          sx={{
            ...memoMaskSx,
            backgroundColor: 'rgba(0,0,0,0.5)',
            position: 'fixed',
            zIndex: -1,
          }}
        />
      )
    }
    return null
  }, [memoMaskSx])

  if (status === 'needReload') {
    return (
      <Box sx={memoMaskSx}>
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
        {memoImmersiveChatMask}
      </Box>
    )
  }

  if (!authLogin.isLogin) {
    return (
      <Box sx={memoMaskSx}>
        <Stack width={'calc(100% - 16px)'}>
          <Stack
            spacing={1.5}
            p={3}
            pb={2}
            sx={{
              maxWidth: '414px',
              mx: 'auto!important',
              borderRadius: '4px 4px 0 0',
              width: '100%',
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? '#4f4f4f' : '#F5F6F7',
            }}
          >
            <Stack
              direction={'row'}
              alignItems={'center'}
              justifyContent={'center'}
              width={'100%'}
              spacing={1}
            >
              <UseChatGptIcon sx={{ fontSize: '24px' }} />
              <Typography
                fontSize={'23px'}
                fontWeight={700}
                color={'text.secondary'}
                textAlign={'center'}
              >
                Use 1-Click Anywhere Online
              </Typography>
            </Stack>
            <Stack
              direction={'row'}
              sx={{
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
              }}
            >
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <AIProviderIcon
                  aiProviderType={'USE_CHAT_GPT_PLUS'}
                  size={20}
                />
                <Typography
                  component={'span'}
                  fontSize={'16px'}
                  color={'text.secondary'}
                >
                  ChatGPT
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <AIProviderIcon aiProviderType={'MAXAI_CLAUDE'} size={20} />
                <Typography
                  component={'span'}
                  fontSize={'16px'}
                  color={'text.secondary'}
                >
                  Claude
                </Typography>
              </Stack>
              <Stack direction={'row'} alignItems={'center'} spacing={1}>
                <AIProviderIcon aiProviderType={'MAXAI_GEMINI'} size={20} />
                <Typography
                  component={'span'}
                  fontSize={'16px'}
                  color={'text.secondary'}
                >
                  Gemini
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Paper
            sx={{
              maxWidth: '414px',
              mx: 'auto!important',
              width: '100%',
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: '0 0 4px 4px',
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
                <Typography
                  fontSize={'24px'}
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
                  disableElevation
                  variant={'contained'}
                  sx={{
                    height: 48,
                    color: '#fff',
                    border: 'none',
                    bgcolor: '#4285F4',
                    fontSize: 14,
                    '&:hover': {
                      bgcolor: '#366dc9',
                    },
                  }}
                >
                  <Stack direction={'row'} spacing={2} alignItems={'center'}>
                    <Stack
                      sx={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        bgcolor: '#fff',
                      }}
                      justifyContent={'center'}
                      alignItems={'center'}
                    >
                      <GoogleIcon sx={{ fontSize: '24px' }} />
                    </Stack>
                    <span>Continue with Google</span>
                  </Stack>
                </Button>
              </Link>
              <Divider sx={{ width: '100%' }}>OR</Divider>
              <Link
                href={APP_USE_CHAT_GPT_HOST + '/login-email'}
                target={'_blank'}
                sx={{ width: '100%' }}
              >
                <Button
                  fullWidth
                  disableElevation
                  variant={'outlined'}
                  sx={{
                    height: 48,
                    textIndent: '16px',
                    fontSize: 14,
                  }}
                >
                  <Stack
                    direction={'row'}
                    spacing={2}
                    alignItems={'center'}
                    sx={{
                      color: 'primary.main',
                    }}
                  >
                    <ContextMenuIcon icon={'Email'} sx={{ fontSize: '24px' }} />
                    <span>Continue with Email</span>
                  </Stack>
                </Button>
              </Link>
            </Stack>
          </Paper>
        </Stack>
        {memoImmersiveChatMask}
      </Box>
    )
  }

  // 即使 success 了 providerConfirmDialogOpen 为 true 时需要显示
  if (status === 'success' && !providerConfirmDialogOpen) {
    return null
  }

  return (
    <Box sx={memoMaskSx}>
      <Paper
        sx={{
          position: 'absolute',
          right: 8,
          bottom: 125,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          filter: `blur(${providerConfirmDialogOpen ? 5 : 0}px)`,
          pointerEvents: providerConfirmDialogOpen ? 'none' : 'auto',
        }}
      >
        <AIProviderSelectorCard />
      </Paper>

      <Paper
        sx={{
          position: 'absolute',
          right: 8,
          bottom: '2%',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          userSelect: 'auto',
        }}
      >
        <ThirdPartAIProviderConfirmDialog />
      </Paper>
      {memoImmersiveChatMask}
    </Box>
  )
}

export { ChatGPTStatusWrapper }
