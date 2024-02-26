import Stack from '@mui/material/Stack'
import React, { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import { findSelectorParent } from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import SidebarCopyButton from '@/features/sidebar/components/SidebarChatBox/SidebarCopyButton'
import SidebarAIMessageAttachmentsDownloadButton from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageImageContent/SidebarAIMessageAttachmentsDownloadButton'
import { formatAIMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'

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
              const newImage = new Image()
              await new Promise((resolve) => {
                try {
                  newImage.src = image.src
                  newImage.crossOrigin = 'anonymous'
                  newImage.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = newImage.naturalWidth
                    canvas.height = newImage.naturalHeight
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                      ctx.drawImage(newImage, 0, 0)
                      canvas.toBlob(function (blob) {
                        if (blob) {
                          const item = new ClipboardItem({ 'image/png': blob })
                          navigator.clipboard
                            .write([item])
                            .then(function () {
                              console.log('Image copied to clipboard')
                              resolve(true)
                            })
                            .catch(function (error) {
                              console.error(
                                'Error copying image to clipboard',
                                error,
                              )
                              resolve(false)
                            })
                            .finally(() => {})
                        } else {
                          resolve(false)
                        }
                      })
                    }
                  }
                  newImage.onerror = () => {
                    resolve(false)
                  }
                } catch (e) {
                  resolve(false)
                }
              })
            } catch (e) {
              console.error('Error copying image to clipboard', e)
            } finally {
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
