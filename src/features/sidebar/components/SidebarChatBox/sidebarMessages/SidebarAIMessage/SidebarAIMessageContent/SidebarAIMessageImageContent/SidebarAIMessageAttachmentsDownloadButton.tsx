import CircularProgress from '@mui/material/CircularProgress'
import { SxProps } from '@mui/material/styles'
import { saveAs } from 'file-saver'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { IChatMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import {
  clientGetMaxAIFileUrlWithFileId,
  getChatMessageAttachments,
  getMaxAIFileIdFromAttachmentURL,
} from '@/features/sidebar/utils/chatMessageAttachmentHelper'
import { promiseTimeout } from '@/utils/promiseUtils'

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
        try {
          const result = await promiseTimeout(
            clientFetchAPI(downloadUrl, {
              parse: 'blob',
              contentType: 'image/png',
            }),
            20 * 1000,
            {
              success: false,
            } as any,
          )
          if (result.success && result?.data?.type) {
            let fileName = message.text
            if (isAIMessage(message)) {
              fileName = message.originalMessage?.metadata?.title?.title || ''
            }
            // download image
            saveAs(result.data, `${fileName}.png`)
          } else {
            // NOTE: 保底方案
            const a = document.createElement('a')
            a.href = downloadUrl
            a.download = 'download'
            a.click()
            a.remove()
          }
        } catch (e) {
          console.error(e)
        }
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
