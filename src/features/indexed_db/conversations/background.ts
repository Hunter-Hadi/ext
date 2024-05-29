/**
 * 运行环境必须在background
 */

import orderBy from 'lodash-es/orderBy'

import ConversationManager from '@/background/src/chatConversations'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { isUserMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { IIndexDBAttachment } from '@/features/indexed_db/conversations/models/Attachement'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { ConversationDB } from '@/features/indexed_db/conversations/models/db'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'

export const backgroundConversationDB = new ConversationDB()
/**
 * 删除对话
 * @param conversationId
 * @param softDelete
 */
export const backgroundConversationDBRemoveConversation = async (
  conversationId: string,
  softDelete: boolean,
) => {
  const conversation = await backgroundConversationDB.conversations.get(
    conversationId,
  )
  if (!conversation) {
    return false
  }
  const messages = await backgroundConversationDB.messages
    .where('conversationId')
    .equals(conversationId)
    .toArray()
  const attachments = await backgroundConversationDB.attachments
    .where('messageId')
    .anyOf(messages.map((message) => message.messageId))
    .toArray()
  debugger
  try {
    if (softDelete) {
      conversation.isDelete = true
      await backgroundConversationDB.conversations.put(conversation)
    } else {
      await backgroundConversationDB.transaction(
        'rw',
        backgroundConversationDB.conversations,
        backgroundConversationDB.messages,
        backgroundConversationDB.attachments,
        () => {
          backgroundConversationDB.conversations.delete(conversationId)
          backgroundConversationDB.messages.bulkDelete(
            messages.map((message) => message.messageId),
          )
          backgroundConversationDB.attachments.bulkDelete(
            attachments.map((attachment) => attachment.id),
          )
        },
      )
    }
    return true
  } catch (e) {
    console.error(`ConversationDB 删除对话${conversationId}失败`, e)
    return false
  }
}
/**
 * 删除消息
 * @param conversationIds
 * @param messageIds
 */
export const backgroundConversationDBRemoveMessages = async (
  conversationIds: string,
  messageIds: string[],
) => {
  try {
    const attachments = await backgroundConversationDB.attachments
      .where('messageId')
      .anyOf(messageIds)
      .toArray()
    await backgroundConversationDB.transaction(
      'rw',
      backgroundConversationDB.messages,
      backgroundConversationDB.attachments,
      () => {
        backgroundConversationDB.messages.bulkDelete(messageIds)
        backgroundConversationDB.attachments.bulkDelete(
          attachments.map((attachment) => attachment.id),
        )
      },
    )
    return true
  } catch (e) {
    console.error(`ConversationDB 删除对话${conversationIds}的消息失败`, e)
    return false
  }
}

/**
 * 迁移对话到V3版本
 * @description - 因为是迁移，所以要用事务
 * @param conversation
 */
export const backgroundMigrateConversationV3 = async (
  conversation: IConversation,
) => {
  const saveConversationAction: any = {
    conversationId: conversation.id,
    lastRunActions: undefined,
    lastRunActionsParams: undefined,
    lastRunActionsMessageId: undefined,
  }
  const startTime = new Date().getTime()
  // 如果是V3版本, 不需要迁移
  if (conversation.version !== 3) {
    conversation.version = 3
    /**
     * 老版本没有这个字段
     */
    if (!conversation.authorId) {
      conversation.authorId = await getMaxAIChromeExtensionUserId()
    }
    /**
     * 老版本没有这个字段
     */
    if (!Object.prototype.hasOwnProperty.call(conversation, 'isDelete')) {
      conversation.isDelete = false
    }
    /**
     * 提取最后运行的shortcuts
     */
    if (
      conversation.meta.lastRunActions ||
      conversation.meta.lastRunActionsParams ||
      conversation.meta.lastRunActionsMessageId
    ) {
      saveConversationAction.lastRunActions = conversation.meta.lastRunActions
      saveConversationAction.lastRunActionsParams =
        conversation.meta.lastRunActionsParams
      saveConversationAction.lastRunActionsMessageId =
        conversation.meta.lastRunActionsMessageId
      conversation.meta.lastRunActions = undefined
      conversation.meta.lastRunActionsParams = undefined
      conversation.meta.lastRunActionsMessageId = undefined
    }
    /**
     * 更新share字段
     */
    if (conversation.share) {
      conversation.share.id = conversation.share.shareId
      conversation.share.enable = conversation.share.enabled
      delete conversation.share.shareId
      delete conversation.share.enabled
      delete conversation.share.shareType
    }
  }
  const messages = conversation.messages || []
  const saveMessages: IChatMessage[] = []
  const saveAttachments: IIndexDBAttachment[] = []
  if (messages.length > 0) {
    if (!Object.prototype.hasOwnProperty.call(conversation, 'lastMessageId')) {
      conversation.lastMessageId = messages[messages.length - 1].messageId
    }
    // 寻找最后一条消息的时间
    let lastMessageIdCreatedAt: string | null = null
    await Promise.all(
      messages.map(async (message) => {
        if (!conversation.lastMessageId) {
          if (
            message.created_at &&
            (!lastMessageIdCreatedAt ||
              new Date(lastMessageIdCreatedAt).getTime() <
                new Date(message.created_at).getTime())
          ) {
            conversation.lastMessageId = message.messageId
            lastMessageIdCreatedAt = message.created_at
          }
        }
        message.conversationId = conversation.id
        // TODO: 为了上线速度，不拆把attachments缓存表了 - 2024-05-28
        const TODO = true
        if (!TODO) {
          if (isUserMessage(message) && message.meta?.attachments) {
            message.meta.attachments = await Promise.all(
              message.meta.attachments.map(async (attachment) => {
                // 如果是提取文件内容的文件, 先还原文件,再存成附件
                if (attachment.extractedContent) {
                  try {
                    const file = new File(
                      [attachment.extractedContent],
                      attachment.fileName,
                      {
                        type: attachment.fileType,
                      },
                    )
                    const getAttachmentBinaryData = async () => {
                      return new Promise<string>((resolve) => {
                        const reader = new FileReader()
                        reader.onload = () => {
                          resolve(reader.result as string)
                        }
                        reader.readAsArrayBuffer(file)
                      })
                    }
                    const newAttachment: IIndexDBAttachment = {
                      id: attachment.id,
                      messageId: message.messageId,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      fileSize: attachment.fileSize,
                      fileName: attachment.fileName,
                      fileType: attachment.fileType,
                      binaryData: await getAttachmentBinaryData(),
                      extractedText: attachment.extractedContent,
                    }
                    attachment.extractedContent = undefined
                    saveAttachments.push(newAttachment)
                  } catch (e) {
                    console.error(
                      `ConversationDB[V3] 迁移对话${conversation.id}的消息${message.messageId}的附件失败`,
                    )
                  }
                } else if (
                  attachment.base64Data &&
                  attachment.fileType.includes('image')
                ) {
                  const newAttachment: IIndexDBAttachment = {
                    id: attachment.id,
                    messageId: message.messageId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    fileSize: attachment.fileSize,
                    fileName: attachment.fileName,
                    fileType: attachment.fileType,
                    binaryData: attachment.base64Data,
                  }
                  attachment.base64Data = undefined
                  saveAttachments.push(newAttachment)
                }
                return attachment
              }),
            )
          }
        }
        saveMessages.push(message)
        return message
      }),
    )
  }
  conversation.messages = []
  return backgroundConversationDB
    .transaction(
      'rw',
      backgroundConversationDB.conversations,
      backgroundConversationDB.messages,
      backgroundConversationDB.attachments,
      backgroundConversationDB.conversationLocalStorage,
      async () => {
        console.log(
          `ConversationDB[V3] 对话${conversation.id}的[${saveMessages.length}]条消息, [${saveAttachments.length}]个附件`,
        )
        backgroundConversationDB.conversationLocalStorage.put(
          saveConversationAction,
        )
        backgroundConversationDB.conversations.put(conversation)
        backgroundConversationDB.messages.bulkPut(saveMessages)
        backgroundConversationDB.attachments.bulkPut(saveAttachments)
      },
    )
    .then(() => {
      console.log(
        `ConversationDB[V3] 迁移对话${conversation.id}完成, 耗时${
          new Date().getTime() - startTime
        }ms`,
      )
      ConversationManager.oldVersionConversationDB
        .deleteConversation(conversation.id)
        .then()
        .catch()
      return backgroundConversationDB.conversations.get(conversation.id)
    })
}

export const backgroundConversationDBGetMessageIds = async (
  conversationId: string,
) => {
  const messages = await backgroundConversationDB.messages
    .where('conversationId')
    .equals(conversationId)
    .toArray((messages) =>
      messages.map((message) => ({
        messageId: message.messageId,
        created_at: message.created_at,
      })),
    )
  console.log(`ConversationDB[V3] 获取消息Ids数量`, messages.length)
  return orderBy(messages, ['created_at'], ['desc']).map(
    (item) => item.messageId,
  )
}
