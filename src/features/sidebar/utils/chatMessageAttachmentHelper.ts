import lodashGet from 'lodash-es/get'

import { fetchBackendApi } from '@/background/api'
import { IChatMessage, IChatUploadFile } from '@/features/chatgpt/types'
import {
  isAIMessage,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'

/**
 * 判断是否是MaxAI的附件
 * @param attachmentUrl
 */
export const isMaxAIAttachmentURL = (attachmentUrl: string) => {
  // https://maxaistorage.s3.amazonaws.com/acc710c0-d554-4e48-a384-b26400e11c2f.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4NYXT5H4KLMTHHPR%2F20240123%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20240123T091756Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=193241b42e2051df2b5aa982fe7f4a334d525843667937315e84bb5d648a7e22
  if (attachmentUrl.includes('maxaistorage.s3.amazonaws.com')) {
    return true
  }
  return false
}
/**
 * 从MaxAI附件URL中获取fileId
 * @param attachmentUrl
 */
export const getMaxAIFileIdFromAttachmentURL = (attachmentUrl: string) => {
  // acc710c0-d554-4e48-a384-b26400e11c2f.webp
  if (isMaxAIAttachmentURL(attachmentUrl)) {
    return attachmentUrl.split('/').pop()?.split('?').shift() || ''
  }
  return null
}
/**
 * 获取消息中的MaxAI附件
 * @param message
 */
export const getChatMessageAttachments = (
  message: IChatMessage,
): IChatUploadFile[] => {
  if (isUserMessage(message)) {
    return lodashGet(message, 'meta.attachments', [])
  } else if (isAIMessage(message)) {
    return lodashGet(message, 'originalMessage.metadata.attachments', [])
  }
  return []
}
/**
 * 判断是否是过期的MaxAI附件
 * @param attachment
 */
export const isMaxAIAttachmentExpired = (attachment: IChatUploadFile) => {
  if (attachment.uploadedUrl && attachment.uploadedFileId) {
    try {
      const urlParams = new URL(attachment.uploadedUrl).searchParams
      const xAmzDate = urlParams.get('X-Amz-Date') || '' // 20211018T080000Z
      // 提取日期和时间部分
      const datePart = xAmzDate.substring(0, 8) // 提取'20211018'
      const timePart = xAmzDate.substring(9, 15) // 提取'080000'
      const createdAt = new Date(
        Date.UTC(
          Number(datePart.substring(0, 4)),
          Number(datePart.substring(4, 6)) - 1,
          Number(datePart.substring(6, 8)),
          Number(timePart.substring(0, 2)),
          Number(timePart.substring(2, 4)),
          Number(timePart.substring(4, 6)),
        ),
      )
      const expiredAt = urlParams.get('X-Amz-Expires') // 604800
      if (createdAt && expiredAt) {
        const expiredDate = new Date(
          new Date(createdAt).getTime() + Number(expiredAt) * 1000,
        )
        if (expiredDate.getTime() < Date.now()) {
          return true
        }
      }
      return false
    } catch (e) {
      return false
    }
  }
  return false
}
/**
 * 通过fileId获取MaxAI的附件
 * @param fileId
 * @param config
 */
export const clientGetMaxAIFileUrlWithFileId = async (
  fileId: string,
  config?: {
    message_id?: string
    conversation_id?: string
  },
): Promise<{ file_id: string; file_url: string } | null> => {
  const result = await fetchBackendApi('/app/get_file', {
    file_id: fileId,
    ...config,
  })
  if (result.file_id && result.file_url) {
    return {
      ...result,
    }
  }
  return null
}
