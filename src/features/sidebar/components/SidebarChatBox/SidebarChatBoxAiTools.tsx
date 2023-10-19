import React, { FC, useMemo } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import ReplyIcon from '@mui/icons-material/Reply'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import { hideChatBox } from '@/utils'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import { useTranslation } from 'react-i18next'

const TEMP_CLOSE_HOSTS = ['www.linkedin.com']

const SidebarChatBoxAiTools: FC<{
  insertAble?: boolean
  replaceAble?: boolean
  useChatGPTAble?: boolean
  message: IAIResponseMessage
  onCopy?: () => void
}> = (props) => {
  const { t } = useTranslation(['common', 'client'])
  const { message, insertAble } = props
  const insertAbleMemo = useMemo(() => {
    return insertAble
  }, [insertAble])
  const gmailChatBoxAiToolsRef = React.useRef<HTMLDivElement>(null)
  const memoCopyText = useMemo(() => {
    let currentCopyText = message.originalMessage?.content?.text || message.text
    if (message.originalMessage?.metadata?.sources?.links) {
      const links = message.originalMessage.metadata.sources.links
      let citations = `\n\nCitations:`
      if (links.length > 0) {
        links.forEach((link, index) => {
          citations += `\n[${index + 1}] ${link.url}`
        })
      }
      currentCopyText += citations
    }
    return currentCopyText
  }, [message])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      spacing={1}
      ref={gmailChatBoxAiToolsRef}
    >
      {insertAbleMemo && (
        <Button
          disableElevation
          size={'small'}
          variant={'contained'}
          title={'insert to draft'}
          startIcon={<ReplyIcon />}
          onClick={() => {
            // TODO
          }}
        >
          {t('client:sidebar__button__insert')}
        </Button>
      )}
      <CopyTooltipIconButton
        className={'max-ai__actions__button--copy'}
        copyText={memoCopyText}
        onCopy={() => {
          props.onCopy?.()
          if (TEMP_CLOSE_HOSTS.includes(window.location.host)) {
            setTimeout(hideChatBox, 1)
          }
        }}
      />
      {props.useChatGPTAble && (
        <FloatingInputButton
          className={'max-ai__actions__button--use-max-ai'}
          iconButton
          onBeforeShowContextMenu={() => {
            return {
              template: message.text,
              target: gmailChatBoxAiToolsRef.current
                ?.parentElement as HTMLElement,
            }
          }}
        />
      )}
    </Stack>
  )
}
export default SidebarChatBoxAiTools
