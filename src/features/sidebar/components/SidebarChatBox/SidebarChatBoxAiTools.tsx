import ReplyIcon from '@mui/icons-material/Reply'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IAIResponseMessage } from '@/features/chatgpt/types'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import SidebarCopyButton from '@/features/sidebar/components/SidebarChatBox/SidebarCopyButton'
import { formatAIMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'

const SidebarChatBoxAiTools: FC<{
  insertAble?: boolean
  replaceAble?: boolean
  useChatGPTAble?: boolean
  message: IAIResponseMessage
  onCopy?: () => void
}> = (props) => {
  const { t } = useTranslation(['common', 'client'])
  const { message, insertAble, onCopy } = props
  const insertAbleMemo = useMemo(() => {
    return insertAble
  }, [insertAble])
  const gmailChatBoxAiToolsRef = React.useRef<HTMLDivElement>(null)
  const memoCopyText = useMemo(() => {
    return formatAIMessageContent(message)
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
      <SidebarCopyButton message={message} onCopy={onCopy} />
      {props.useChatGPTAble && (
        <FloatingInputButton
          className={'max-ai__actions__button--use-max-ai'}
          iconButton
          onBeforeShowContextMenu={() => {
            return {
              template: memoCopyText,
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
