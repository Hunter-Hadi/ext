import cloneDeep from 'lodash-es/cloneDeep'
import lodashGet from 'lodash-es/get'
import lodashSet from 'lodash-es/set'
import { useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  isAIMessage,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { chatMessageAttachmentStateFamily } from '@/features/sidebar/store/chatMessageStore'
import {
  clientGetMaxAIFileUrlWithFileId,
  isMaxAIAttachmentExpired,
} from '@/features/sidebar/utils/chatMessageAttachmentHelper'

// 用来更新消息中过期的文件
const useChatMessageExpiredFileUpdater = (message: IChatMessage) => {
  const { currentConversationId } = useClientConversation()
  const [, setChatMessageAttachment] = useRecoilState(
    chatMessageAttachmentStateFamily(message.messageId),
  )
  const isCheckRef = useRef(false)
  useEffect(() => {
    if (!isCheckRef.current && currentConversationId && message) {
      isCheckRef.current = true
      // MaxAI附件的key
      let maxAIAttachmentsKey: string[] = []
      if (isUserMessage(message)) {
        // UserMessage 的附件在 meta.attachments
        maxAIAttachmentsKey = ['meta.attachments']
      } else if (isAIMessage(message)) {
        // AIMessage 的附件在 originalMessage.metadata.attachments
        maxAIAttachmentsKey = ['originalMessage.metadata.attachments']
      }
      // 过滤出过期的附件
      const needUpdateKeys = maxAIAttachmentsKey.filter((key) => {
        const attachments = lodashGet(message, key)
        if (attachments instanceof Array) {
          return attachments.find(isMaxAIAttachmentExpired)
        }
        return false
      })
      // 如果有过期的附件，就更新
      if (needUpdateKeys.length > 0) {
        setChatMessageAttachment((prev) => ({ ...prev, fileUpdating: true }))
        Promise.all(
          needUpdateKeys.map(async (needUpdateKey) => {
            const newMessage = cloneDeep(message)
            const attachments = lodashGet(newMessage, needUpdateKey)
            let hasUpdate = false
            if (attachments instanceof Array) {
              const newAttachments = await Promise.all(
                attachments.map(async (attachment) => {
                  if (isMaxAIAttachmentExpired(attachment)) {
                    const newFile = await clientGetMaxAIFileUrlWithFileId(
                      attachment.uploadedFileId,
                      {},
                    )
                    if (newFile) {
                      hasUpdate = true
                      attachment.uploadedFileId =
                        newFile?.file_id || attachment.uploadedFileId
                      attachment.uploadedUrl =
                        newFile?.file_url || attachment.uploadedUrl
                    }
                  }
                  return attachment
                }),
              )
              if (hasUpdate) {
                lodashSet(newMessage, needUpdateKey, newAttachments)
                // 更新消息
                await ClientConversationMessageManager.updateMessage(
                  currentConversationId,
                  newMessage,
                )
              }
              return newAttachments
            }
            return needUpdateKey
          }),
        )
          .then()
          .catch()
          .finally(() => {
            setChatMessageAttachment((prev) => ({
              ...prev,
              loaded: true,
              fileUpdating: false,
            }))
          })
      } else {
        setChatMessageAttachment((prev) => ({
          ...prev,
          loaded: true,
          fileUpdating: false,
        }))
      }
    }
  }, [message.messageId])
}

export default useChatMessageExpiredFileUpdater
