import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { FloatingInputButton } from '@/features/contextMenu/components/FloatingContextMenu/FloatingInputButton'
import { findSelectorParent } from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import SidebarCopyButton from '@/features/sidebar/components/SidebarChatBox/SidebarCopyButton'
import SidebarAIMessageImageContentDownloadButton from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageImageContent/SidebarAIMessageImageContentDownloadButton'
import { formatAIMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'

const SidebarAIMessageTools: FC<{
  useChatGPTAble?: boolean
  message: IAIResponseMessage
}> = (props) => {
  const { message } = props
  const { t } = useTranslation(['common'])
  const messageContentType =
    message.originalMessage?.content?.contentType || 'text'
  const gmailChatBoxAiToolsRef = React.useRef<HTMLDivElement>(null)
  const memoCopyText = useMemo(() => {
    return formatAIMessageContent(message)
  }, [message])
  const downloadUrl = useMemo(() => {
    if (messageContentType !== 'image') {
      return ''
    }
    try {
      const image = JSON.parse(
        message?.originalMessage?.content?.text || '[]',
      )?.find((image: any) => image.downloadUrl || image.url)
      return image?.downloadUrl || image?.url
    } catch (e) {
      return ''
    }
  }, [message, messageContentType])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      spacing={1}
      ref={gmailChatBoxAiToolsRef}
    >
      {messageContentType === 'image' && (
        <TooltipIconButton
          title={t('common:copy_image')}
          onClick={(event) => {
            const image = findSelectorParent(
              '.maxai-ai-message__image__content__box img',
              event.currentTarget,
            ) as HTMLImageElement
            if (!image) {
              return
            }
            // 创建一个canvas元素
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')

            // 设置canvas的宽高与图片相同
            canvas.width = image.naturalWidth
            canvas.height = image.naturalHeight

            // 将图片绘制到canvas上
            context!.drawImage(image, 0, 0)
            canvas.toBlob((blob) => {
              if (blob) {
                navigator.clipboard
                  .write([
                    new ClipboardItem({
                      [blob.type]: blob,
                    }),
                  ])
                  .then(() => {
                    console.log('Copied')
                  })
              }
            })
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
      {messageContentType === 'image' && downloadUrl && (
        <SidebarAIMessageImageContentDownloadButton downloadUrl={downloadUrl} />
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
