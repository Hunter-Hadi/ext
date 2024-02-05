import Stack from '@mui/material/Stack'
import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import { findSelectorParent } from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import SidebarCopyButton from '@/features/sidebar/components/SidebarChatBox/SidebarCopyButton'
import SidebarAIMessageAttachmentsDownloadButton from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageImageContent/SidebarAIMessageAttachmentsDownloadButton'
import { formatAIMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'
import { promiseTimeout } from '@/utils/promiseUtils'

const SidebarAIMessageTools: FC<{
  useChatGPTAble?: boolean
  message: IAIResponseMessage
}> = (props) => {
  const { message } = props
  const { t } = useTranslation(['common'])
  const [isCoping, setIsCoping] = useState(false)
  const messageContentType =
    message.originalMessage?.content?.contentType || 'text'
  const gmailChatBoxAiToolsRef = React.useRef<HTMLDivElement>(null)
  const memoCopyText = useMemo(() => {
    return formatAIMessageContent(message)
  }, [message])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      spacing={0.5}
      ref={gmailChatBoxAiToolsRef}
    >
      {messageContentType === 'image' && (
        <TooltipIconButton
          loading={isCoping}
          disabled={isCoping}
          title={t('common:copy_image')}
          onClick={async (event) => {
            const image = findSelectorParent(
              '.maxai-ai-message__image__content__box img',
              event.currentTarget,
            ) as HTMLImageElement
            if (!image?.src) {
              return
            }
            setIsCoping(true)
            try {
              const result = await promiseTimeout(
                clientFetchAPI(image.src, {
                  parse: 'blob',
                  blobContentType: 'image/png',
                }),
                20 * 1000,
                {
                  success: false,
                } as any,
              )
              if (result.success && result?.data?.type) {
                navigator.clipboard
                  .write([
                    new ClipboardItem({
                      [result.data.type]: result.data,
                    }),
                  ])
                  .then(() => {
                    setIsCoping(false)
                  })
              } else {
                setIsCoping(false)
              }
            } catch (e) {
              setIsCoping(false)
            }
          }}
        >
          <ContextMenuIcon
            icon={'Copy'}
            sx={{
              fontSize: '16px',
            }}
          />
        </TooltipIconButton>
      )}
      {message && (
        <SidebarAIMessageAttachmentsDownloadButton message={message} />
      )}
      {messageContentType === 'text' && <SidebarCopyButton message={message} />}
      {messageContentType === 'text' && (
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
export default SidebarAIMessageTools
