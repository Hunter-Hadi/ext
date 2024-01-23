import CircularProgress from '@mui/material/CircularProgress'
import { SxProps } from '@mui/material/styles'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { IChatMessage } from '@/features/chatgpt/types'
import {
  clientGetMaxAIFileUrlWithFileId,
  getChatMessageAttachments,
  getMaxAIFileIdFromAttachmentURL,
} from '@/features/sidebar/utils/chatMessageAttachmentHelper'

const SidebarAIMessageAttachmentsDownloadButton: FC<{
  message: IChatMessage
  sx?: SxProps
}> = (props) => {
  const { t } = useTranslation(['common', 'client'])
  const [downloading, setDownloading] = useState(false)
  const { message, sx } = props
  const attachments = getChatMessageAttachments(message)
  const downloadAttachments = async () => {
    setDownloading(true)
    await Promise.all(
      attachments.map(async (attachment) => {
        let downloadUrl = attachment.uploadedUrl
        if (!downloadUrl) {
          return
        }
        const maxAIFileId = getMaxAIFileIdFromAttachmentURL(downloadUrl)
        if (maxAIFileId) {
          if (maxAIFileId.endsWith('.webp')) {
            downloadUrl = downloadUrl =
              (
                await clientGetMaxAIFileUrlWithFileId(
                  maxAIFileId.replace('.webp', '.png'),
                )
              )?.file_url || downloadUrl
          } else {
            downloadUrl =
              (await clientGetMaxAIFileUrlWithFileId(maxAIFileId))?.file_url ||
              downloadUrl
          }
        }
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'download'
        a.click()
        a.remove()
      }),
    )
      .then()
      .catch()
      .finally(() => {
        setDownloading(false)
      })
  }
  if (attachments.length === 0) {
    return null
  }
  return (
    <TooltipIconButton
      sx={{
        ...sx,
      }}
      title={t('common:download_image')}
      onClick={downloadAttachments}
    >
      {downloading ? (
        <CircularProgress size={'16px'} color="inherit" />
      ) : (
        <ContextMenuIcon icon={'FileDownload'} sx={{ fontSize: '16px' }} />
      )}
    </TooltipIconButton>
  )
}

export default SidebarAIMessageAttachmentsDownloadButton
