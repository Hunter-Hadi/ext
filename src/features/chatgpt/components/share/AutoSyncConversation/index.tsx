import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect } from 'react'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSyncConversation from '@/features/chatgpt/hooks/useSyncConversation'

/**
 * 自动同步对话
 * - 当focus
 * - conversationId改变
 * @constructor
 */
const AutoSyncConversation: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { autoSyncConversation, conversationAutoSyncState, enabled } =
    useSyncConversation()
  const { currentConversationId } = useClientConversation()
  /**
   * 当前对话ID改变时，自动同步对话
   * - 当前对话ID改变时，自动同步对话
   * - 当focus时，自动同步对话
   */
  const isSyncingRef = React.useRef(false)
  useEffect(() => {
    if (!currentConversationId || isSyncingRef.current || !enabled) {
      return
    }
    console.log('AutoSyncConversation', currentConversationId)
    const executeAutoSyncConversation = async () => {
      isSyncingRef.current = true
      try {
        await autoSyncConversation(currentConversationId)
      } catch (e) {
        // ignore
      }
      isSyncingRef.current = false
    }
    executeAutoSyncConversation()
    window.addEventListener('focus', executeAutoSyncConversation)
    return () => {
      window.removeEventListener('focus', executeAutoSyncConversation)
    }
  }, [currentConversationId, enabled])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      gap={1}
      sx={{
        ...sx,
      }}
    >
      {conversationAutoSyncState.autoSyncStatus === 'uploading' && (
        <>
          <Typography fontSize={'14px'} color={'text.primary'}>
            {`(${conversationAutoSyncState.autoSyncStep}/${conversationAutoSyncState.autoSyncTotalCount})`}
          </Typography>
          <SyncOutlinedIcon
            sx={{
              color: 'primary.main',
              // 一直旋转
              animation: 'spin 2s linear infinite',
              '@keyframes spin': {
                from: {
                  transform: 'rotate(0deg)',
                },
                to: {
                  transform: 'rotate(360deg)',
                },
              },
            }}
          />
        </>
      )}
    </Stack>
  )
}
export default AutoSyncConversation
