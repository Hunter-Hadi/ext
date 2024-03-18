import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IUserChatMessage } from '@/features/chatgpt/types'
import messageWithErrorBoundary from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/messageWithErrorBoundary'
import SidebarChatBoxUserTools from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarUserMessage/SidebarChatBoxUserTools'
import SidebarUserMessageContexts from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarUserMessage/SidebarUserMessageContexts'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'

const BaseSidebarUserMessage: FC<{
  message: IUserChatMessage
  order?: number
}> = (props) => {
  const { t } = useTranslation(['client'])
  const { message, order } = props
  const memoSx = useMemo(() => {
    return {
      whiteSpace: 'pre-wrap',
      p: 1,
      gap: 1,
      wordBreak: 'break-word',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      bgcolor: 'rgba(144, 101, 176, 0.16)',
      // border: '1px solid',
      // borderColor: isDarkMode ? 'customColor.borderColor' : 'transparent',
      color: 'text.primary',
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

  const showDivider = useMemo(() => {
    return !message.meta?.includeHistory && order !== 1
  }, [message, order])

  return (
    <Box component={'div'} className={'chat-message--user'}>
      {showDivider && (
        <Divider sx={{ mb: 2 }}>
          <Typography color={'text.secondary'} fontSize={'12px'}>
            {t('client:sidebar__conversation__message__context_cleared')}
          </Typography>
        </Divider>
      )}
      <SidebarUserMessageContexts message={message} />
      <Stack
        className={'chat-message--text'}
        sx={{
          ...memoSx,
        }}
      >
        {formatChatMessageContent(message)}
        <SidebarChatBoxUserTools message={message} />
      </Stack>
    </Box>
  )
}

export const SidebarUserMessage = messageWithErrorBoundary(
  BaseSidebarUserMessage,
)
