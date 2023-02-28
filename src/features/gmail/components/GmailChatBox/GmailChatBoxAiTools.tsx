import React, { FC } from 'react'
import { Button, Stack } from '@mui/material'
import TooltipIconButton from '@/components/TooltipIconButton'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ReplyIcon from '@mui/icons-material/Reply'
import { IGmailChatMessage } from '../GmailChatBox'
import { useInboxComposeViews } from '../../hooks'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { hideEzMailBox } from '../../utils'

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
            console.log(composeView)
            if (composeView) {
              const composeViewBodyElement = composeView.getBodyElement()
              console.log(composeViewBodyElement)
              if (composeViewBodyElement) {
                // let quoteHTML = ''
                // const quoteElement =
                //   composeViewElement.querySelector('.gmail_quote')
                // if (quoteElement) {
                //   quoteHTML = `<br><div class="gmail_quote">${quoteElement.innerHTML}</div>`
                // }
                const bodyFirstElement =
                  composeViewBodyElement.firstElementChild
                const newBodyHTML = // eslint-disable-next-line no-control-regex
                  message.text.replace(new RegExp('\r?\n', 'g'), '<br />') +
                  '<br />'
                if (bodyFirstElement && bodyFirstElement.tagName === 'DIV') {
                  bodyFirstElement.innerHTML = newBodyHTML
                } else if (
                  bodyFirstElement &&
                  bodyFirstElement.tagName === 'BR'
                ) {
                  const div = document.createElement('div')
                  div.style.direction = composeViewBodyElement.style.direction
                  div.innerHTML = `${newBodyHTML}<br>`
                  composeViewBodyElement.insertBefore(div, bodyFirstElement)
                } else {
                  debugger
                }
                hideEzMailBox()
                // setTimeout(() => {
                //   composeViewBodyElement.focus()
                // }, 0)
              } else {
                composeView.setBodyText(message.text)
              }
            }
          }}
        >
          Insert
        </Button>
      )}
      <CopyToClipboard
        text={message.text}
        options={{
          message: 'Copied!',
          format: 'text/plain',
        }}
        onCopy={props.onCopy}
      >
        <TooltipIconButton title={'Copy to clipboard'}>
          <ContentCopyIcon sx={{ fontSize: 16 }} />
        </TooltipIconButton>
      </CopyToClipboard>
    </Stack>
  )
}
export default GmailChatBoxAiTools
