import React, { FC } from 'react'
import { Stack, SxProps, TextareaAutosize, Typography } from '@mui/material'
import { useCurrentMessageView, useInboxEditValue } from '@/features/gmail/hooks'

const GmailEmailContext: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { messageViewText } = useCurrentMessageView()
  const { currentMessageId, currentDraftId } = useInboxEditValue()
  return (
    <Stack
      spacing={1}
      sx={{
        width: '100%',
        position: 'relative',
        '& textarea': {
          overflowY: 'auto!important',
        },
        ...sx,
      }}
    >
      <p>currentMessageId: {currentMessageId}</p>
      <p>currentDraftId: {currentDraftId}</p>
      <Typography variant={'h3'} fontSize={20}>
        Email context
      </Typography>
      <TextareaAutosize
        style={{
          backgroundColor: 'rgb(245, 246, 247)',
          maxWidth: '100%',
          height: '200px',
          fontSize: '14px',
          padding: '8px',
          borderRadius: '4px',
          overflowY: 'auto',
        }}
        maxRows={8}
        placeholder={
          "(Paste previous email text to generate a reply or leave it empty if you're writing a new email)"
        }
        value={messageViewText}
      />
    </Stack>
  )
}
export { GmailEmailContext }
