import React, { FC, useMemo } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import ReplyIcon from '@mui/icons-material/Reply'
import { useInboxComposeViews } from '@/features/sidebar/hooks'
import CopyTooltipIconButton from '@/components/CopyTooltipIconButton'
import { hideChatBox } from '@/utils'
import { gmailReplyBoxInsertText } from '@/features/sidebar/utils'
import { useRangy } from '@/features/contextMenu/hooks'
import { IChatMessage } from '@/features/chatgpt/types'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import { useTranslation } from 'react-i18next'

const TEMP_CLOSE_HOSTS = ['www.linkedin.com']

const SidebarChatBoxAiTools: FC<{
  insertAble?: boolean
  replaceAble?: boolean
  useChatGPTAble?: boolean
  message: IChatMessage
  onCopy?: () => void
}> = (props) => {
  const { t } = useTranslation(['common', 'client'])
  const { currentComposeView } = useInboxComposeViews()
  const { replaceSelectionRangeText, currentSelection } = useRangy()
  const { message, insertAble, replaceAble } = props
  const insertAbleMemo = useMemo(() => {
    return currentComposeView && insertAble
  }, [insertAble])
  const gmailChatBoxAiToolsRef = React.useRef<HTMLDivElement>(null)
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
            const composeView =
              currentComposeView && currentComposeView.getInstance?.()
            if (composeView) {
              const composeViewBodyElement = composeView.getBodyElement()
              if (composeViewBodyElement) {
                gmailReplyBoxInsertText(composeViewBodyElement, message.text)
                hideChatBox()
              } else {
                composeView.setBodyText(message.text)
              }
            }
          }}
        >
          {t('client:sidebar__button__insert')}
        </Button>
      )}
      {/*// FIXME: 边界情况太多了*/}
      {false &&
        replaceAble &&
        !insertAbleMemo &&
        currentSelection?.selectionInputAble && (
          <Button
            size={'small'}
            variant={'contained'}
            onClick={() => {
              replaceSelectionRangeText(message.text)
              hideChatBox()
            }}
          >
            {t('client:sidebar__button__replace')}
          </Button>
        )}
      <CopyTooltipIconButton
        className={'max-ai__actions__button--copy'}
        copyText={message.text}
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
