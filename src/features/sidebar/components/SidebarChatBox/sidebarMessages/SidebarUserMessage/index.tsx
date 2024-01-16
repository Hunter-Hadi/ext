import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useMemo } from 'react'

import ChatIconFileList from '@/features/chatgpt/components/ChatIconFileUpload/ChatIconFileList'
import { IChatUploadFile, IUserChatMessage } from '@/features/chatgpt/types'
import messageWithErrorBoundary from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/messageWithErrorBoundary'
import SidebarChatBoxUserTools from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarUserMessage/SidebarChatBoxUserTools'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { useCustomTheme } from '@/hooks/useCustomTheme'

const BaseSidebarUserMessage: FC<{
  message: IUserChatMessage
}> = (props) => {
  const { message } = props
  const { isDarkMode } = useCustomTheme()
  const memoSx = useMemo(() => {
    return {
      whiteSpace: 'pre-wrap',
      p: 1,
      gap: 1,
      wordBreak: 'break-word',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      bgcolor: isDarkMode ? '#6B23C259 !important' : '#F1E2FD !important',
      border: '1px solid',
      borderColor: isDarkMode ? 'customColor.borderColor' : 'transparent',
      color: isDarkMode ? '#FFFFFFDE' : 'rgba(0,0,0,0.87)!important',
      maxWidth: '100%',
      width: 'auto',
      borderRadius: '8px',
      borderBottomRightRadius: 0,
      flexWrap: 'wrap',
      ml: 'auto',
      mr: '0',
      overflow: 'hidden',
    } as SxProps
  }, [message])
  const renderData = useMemo(() => {
    let attachments: IChatUploadFile[] = []
    if (message.type === 'user') {
      attachments = (message as IUserChatMessage)?.meta?.attachments || []
      if (attachments && attachments.length) {
        attachments = attachments.filter(
          (item) => item.uploadStatus === 'success',
        )
      }
    }
    return {
      attachments,
      messageText: formatChatMessageContent(message),
    }
  }, [message])
  console.log('测试性能SidebarUserMessage', 'rerender')
  return (
    <Stack
      className={'chat-message--text'}
      sx={{
        ...memoSx,
      }}
    >
      {renderData.attachments.length > 0 && (
        <ChatIconFileList
          size={'small'}
          direction={'row'}
          disabledRemove
          sx={{ mb: 1 }}
          files={renderData.attachments}
        />
      )}
      {renderData.messageText}
      <SidebarChatBoxUserTools message={message} />
    </Stack>
  )
}

export const SidebarUserMessage = messageWithErrorBoundary(
  BaseSidebarUserMessage,
)