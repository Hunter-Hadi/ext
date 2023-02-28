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
        >
          Retry
        </Button>
      )}
    </Stack>
  )
}
export default GmailChatBoxSystemTools
