import React, { FC } from 'react'
import { Button, Stack } from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'
import { IGmailChatMessage } from '../GmailChatBox'
import { useInboxComposeViews } from '../../hooks'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import { hideEzMailBox } from '@/utils'
import { gmailReplyBoxInsertText } from '@/features/gmail'

const GmailChatBoxAiTools: FC<{
  insertAble?: boolean
  message: IGmailChatMessage
  onCopy?: () => void
}> = (props) => {
  const { currentComposeView } = useInboxComposeViews()
  const { message, insertAble } = props
  return (
    <Stack direction={'row'} alignItems={'center'} spacing={1}>
      {insertAble && (
        <Button
          disableElevation
          size={'small'}
          variant={'contained'}
          title={'insert to draft'}
          startIcon={<ReplyIcon />}
          onClick={() => {
            const composeView =
              currentComposeView && currentComposeView.getInstance?.()
            if (composeView) {
              const composeViewBodyElement = composeView.getBodyElement()
              if (composeViewBodyElement) {
                gmailReplyBoxInsertText(composeViewBodyElement, message.text)
                hideEzMailBox()
              } else {
                composeView.setBodyText(message.text)
              }
            }
          }}
        >
          Insert
        </Button>
      )}
      <CopyTooltipIconButton
        copyText={message.text}
        onCopy={() => {
          props.onCopy?.()
        }}
      />
    </Stack>
  )
}
export default GmailChatBoxAiTools
