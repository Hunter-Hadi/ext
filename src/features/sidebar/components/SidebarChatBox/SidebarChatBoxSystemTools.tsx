import React, { FC } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'

const SidebarChatBoxSystemTools: FC<{
  onRetry: () => void
  message: ISystemChatMessage
}> = (props) => {
  const { onRetry, message } = props
  const chatMessageType = message.extra.systemMessageType || 'normal'
  return (
    <Stack direction={'row'} alignItems={'center'}>
      {chatMessageType === 'normal' && message.parentMessageId && (
        <Button
          size={'small'}
          variant={'outlined'}
          color={'error'}
          onClick={onRetry}
          sx={{
            border: '1px solid rgba(244, 67, 54, 0.5)',
            color: '#f44336',
          }}
        >
          Retry
        </Button>
      )}
      {(chatMessageType === 'dailyUsageLimited' ||
        chatMessageType === 'needUpgrade') && (
        <Button
          variant={'contained'}
          color={'primary'}
          target={'_blank'}
          href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
        >
          Upgrade to Pro
        </Button>
      )}
    </Stack>
  )
}
export default SidebarChatBoxSystemTools
