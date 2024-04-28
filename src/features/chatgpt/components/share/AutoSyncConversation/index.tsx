import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect } from 'react'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'

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
  const { clientConversation } = useClientConversation()

  /**
   * 当前对话ID改变时，自动同步对话
   * - 当前对话ID改变时，自动同步对话
   * - 当focus时，自动同步对话
   */
  useEffect(() => {
    console.log('AutoSyncConversation', clientConversation?.id)
    const autoSyncConversation = async () => {
      if (clientConversation?.id) {
      }
    }
    window.addEventListener('focus', autoSyncConversation)
    return () => {
      window.removeEventListener('focus', autoSyncConversation)
    }
  }, [clientConversation?.id])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      sx={{
        ...sx,
      }}
    >
      <div>{clientConversation?.messages.length}</div>
      <CloudSyncOutlinedIcon />
    </Stack>
  )
}
export default AutoSyncConversation
