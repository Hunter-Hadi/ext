import React, { FC, useEffect } from 'react'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'

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
  const { currentConversationId } = useClientConversation()

  /**
   * 当前对话ID改变时，自动同步对话
   * - 当前对话ID改变时，自动同步对话
   * - 当focus时，自动同步对话
   */
  useEffect(() => {
    console.log('AutoSyncConversation', currentConversationId)
    const autoSyncConversation = async () => {}
    window.addEventListener('focus', autoSyncConversation)
    return () => {
      window.removeEventListener('focus', autoSyncConversation)
    }
  }, [currentConversationId])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      sx={{
        ...sx,
      }}
    >
      <div>AutoSyncConversation</div>
      <div>{currentConversationId}</div>
    </Stack>
  )
}
export default AutoSyncConversation
