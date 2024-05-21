import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { FC, useEffect, useMemo } from 'react'
import React from 'react'
import { useRecoilValue, useSetRecoilState } from 'recoil'

import getLiteChromeExtensionDBStorage from '@/background/utils/chromeExtensionStorage/getLiteChromeExtensionDBStorage'
import ChatGPTRefreshPageTips from '@/features/chatgpt/components/ChatGPTRefreshPageTips'
import ThirdPartAIProviderConfirmDialog from '@/features/chatgpt/components/ThirdPartAIProviderConfirmDialog'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ThirdPartyAIProviderConfirmDialogState } from '@/features/chatgpt/store'
import { clientGetConversationStatus } from '@/features/chatgpt/utils'
import { usePrevious } from '@/features/common/hooks/usePrevious'
import { AppDBStorageState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

// import { IChatGPTProviderType } from '@/background/provider/chat'

const ChatGPTStatusWrapper: FC = () => {
  const { currentConversationId } = useClientConversation()
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
