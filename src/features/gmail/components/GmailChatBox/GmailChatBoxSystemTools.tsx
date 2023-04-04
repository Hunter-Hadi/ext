import React, { FC } from 'react'
import { Button, Stack } from '@mui/material'
import { IGmailChatMessage } from './index'

const GmailChatBoxSystemTools: FC<{
  onRetry: () => void
  message: IGmailChatMessage
}> = (props) => {
  const { onRetry, message } = props
  return (
    <Stack direction={'row'} alignItems={'center'}>
      {message.parentMessageId && (
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
    </Stack>
  )
}
export default GmailChatBoxSystemTools
