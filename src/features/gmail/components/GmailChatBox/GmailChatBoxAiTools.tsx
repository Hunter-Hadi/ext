import React, { FC, useMemo } from 'react'
import { Button, Stack } from '@mui/material'
import ReplyIcon from '@mui/icons-material/Reply'
import { IGmailChatMessage } from '../GmailChatBox'
import { useInboxComposeViews } from '../../hooks'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import { hideEzMailBox } from '@/utils'
import { gmailReplyBoxInsertText } from '@/features/gmail'
import { useRangy } from '@/features/contextMenu'

const GmailChatBoxAiTools: FC<{
  insertAble?: boolean
  replaceAble?: boolean
  message: IGmailChatMessage
  onCopy?: () => void
}> = (props) => {
  const { currentComposeView } = useInboxComposeViews()
  const { replaceSelectionRangeText, selectionInputAble } = useRangy()
  const { message, insertAble, replaceAble } = props
  const insertAbleMemo = useMemo(() => {
    return currentComposeView && insertAble
  }, [insertAble])
  return (
    <Stack direction={'row'} alignItems={'center'} spacing={1}>
      {insertAbleMemo && (
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
      {/*// TODO 边界情况太多了*/}
      {false && !insertAbleMemo && selectionInputAble && replaceAble && (
        <Button
          size={'small'}
          variant={'contained'}
          onClick={() => {
            replaceSelectionRangeText(message.text)
            hideEzMailBox()
          }}
        >
          Replace
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
