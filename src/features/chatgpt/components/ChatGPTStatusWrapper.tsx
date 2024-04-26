import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FC, useEffect, useMemo } from 'react'
import React from 'react'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

import getLiteChromeExtensionDBStorage from '@/background/utils/chromeExtensionStorage/getLiteChromeExtensionDBStorage'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { GoogleIcon, UseChatGptIcon } from '@/components/CustomIcon'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { AuthState } from '@/features/auth/store'
import ChatGPTRefreshPageTips from '@/features/chatgpt/components/ChatGPTRefreshPageTips'
import AIProviderIcon from '@/features/chatgpt/components/icons/AIProviderIcon'
import ThirdPartAIProviderConfirmDialog from '@/features/chatgpt/components/ThirdPartAIProviderConfirmDialog'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ThirdPartyAIProviderConfirmDialogState } from '@/features/chatgpt/store'
import { clientGetConversationStatus } from '@/features/chatgpt/utils'
import { usePrevious } from '@/features/common/hooks/usePrevious'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import { AppDBStorageState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'
// import { IChatGPTProviderType } from '@/background/provider/chat'

const ChatGPTStatusWrapper: FC = () => {
  const { currentConversationId } = useClientConversation()
  const [authLogin] = useRecoilState(AuthState)
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const { conversationStatus, updateConversationStatus } =
    useClientConversation()
  const prevStatus = usePrevious(conversationStatus)

  const { open: providerConfirmDialogOpen } = useRecoilValue(
    ThirdPartyAIProviderConfirmDialogState,
  )

  useEffect(() => {
    if (prevStatus !== conversationStatus && conversationStatus === 'success') {
      // get latest settings
      console.log('get latest settings')
      getLiteChromeExtensionDBStorage().then(setAppDBStorage)
    }
  }, [conversationStatus, prevStatus])

  useEffect(() => {
    const onFocused = () => {
      if (!currentConversationId) {
        return
      }
      clientGetConversationStatus(currentConversationId).then((res) => {
        // 如果没有连接上，就需要重新加载
        if (!res.success) {
          updateConversationStatus('needReload')
        }
      })
    }
    window.addEventListener('focus', onFocused)
    return () => {
      window.removeEventListener('focus', onFocused)
    }
  }, [currentConversationId])
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

  if (conversationStatus === 'needReload') {
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
                fontSize={'24px'}
                fontWeight={700}
                color={'text.secondary'}
                textAlign={'center'}
              >
                Use 1-Click AI Anywhere
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
                onClick={() => {
                  mixpanelTrack('sign_up_started', {
                    method: 'google',
                  })
                }}
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
                onClick={() => {
                  mixpanelTrack('sign_up_started', {
                    method: 'email',
                  })
                }}
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
  if (
    conversationStatus === 'needAuth' ||
    conversationStatus === 'loading' ||
    conversationStatus === 'complete' ||
    providerConfirmDialogOpen
  ) {
    return (
      <Box sx={memoMaskSx}>
        <Paper
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
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
  return null
}

export { ChatGPTStatusWrapper }
