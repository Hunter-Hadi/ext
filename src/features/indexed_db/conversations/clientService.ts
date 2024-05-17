// server.ts
import cloneDeep from 'lodash-es/cloneDeep'
import uniqBy from 'lodash-es/uniqBy'

import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import { ISidebarConversationType } from '@/features/sidebar/types'
import Log from '@/utils/Log'

const syncLog = new Log('SyncConversation')

/**
 * 上传消息
 * @param messages
 * @param conversationId
 */
export const clientUploadMessage = async (
  messages: IChatMessage[],
  conversationId: string,
) => {
  let result = await clientFetchMaxAIAPI<{
    status: string
  }>('/conversation/add_messages', {
    conversation_id: conversationId,
    messages,
  })
  // 重试2次
  if (result.data?.status !== 'OK') {
    result = await clientFetchMaxAIAPI<{
      status: string
    }>('/conversation/add_messages', {
      conversation_id: conversationId,
      messages,
    })
    if (result.data?.status !== 'OK') {
      result = await clientFetchMaxAIAPI<{
        status: string
      }>('/conversation/add_messages', {
        conversation_id: conversationId,
        messages,
      })
    }
  }
  return result.data?.status === 'OK'
}
/**
 * 下载消息到本地
 * @param conversationId
 * @param messageIds
 */
export const downloadRemoteMessagesToClient = async (
  conversationId: string,
  messageIds: string[],
) => {
  let downloadMessagesData = await clientFetchMaxAIAPI<{
    status: string
    data: IChatMessage[]
  }>('/conversation/batch_get_message_by_id', {
    conversation_id: conversationId,
    message_ids: messageIds,
  })
  // 重试2次
  if (downloadMessagesData.data?.status !== 'OK') {
    downloadMessagesData = await clientFetchMaxAIAPI<{
      status: string
      data: IChatMessage[]
    }>('/conversation/batch_get_message_by_id', {
      conversation_id: conversationId,
      message_ids: messageIds,
    })
    if (downloadMessagesData.data?.status !== 'OK') {
      downloadMessagesData = await clientFetchMaxAIAPI<{
        status: string
        data: IChatMessage[]
      }>('/conversation/batch_get_message_by_id', {
        conversation_id: conversationId,
        message_ids: messageIds,
      })
    }
  }
  return uniqBy(downloadMessagesData.data?.data || [], 'messageId')
}
/**
 * 下载会话
 * @param conversationId
 */
export const clientDownloadConversation = async (conversationId: string) => {
  // https://dev.maxai.me/conversation/get_conversation
  let downloadConversationData = await clientFetchMaxAIAPI<{
    status: string
    data: IConversation[]
  }>('/conversation/get_conversation', {
    id: conversationId,
  })
  // 重试2次
  if (downloadConversationData.data?.status !== 'OK') {
    downloadConversationData = await clientFetchMaxAIAPI<{
      status: string
      data: IConversation[]
    }>('/conversation/get_conversation', {
      id: conversationId,
    })
    if (downloadConversationData.data?.status !== 'OK') {
      downloadConversationData = await clientFetchMaxAIAPI<{
        status: string
        data: IConversation[]
      }>('/conversation/get_conversation', {
        id: conversationId,
      })
    }
  }
  return downloadConversationData.data?.data
}
/**
 * 检查会话是否需要同步
 * @param conversationId
 */
export const checkConversationNeedSync = async (
  conversationId: string,
): Promise<{
  needSync: boolean
  needSyncCount: number
  totalCount: number
}> => {
  const localConversation = await ClientConversationManager.getConversation(
    conversationId,
  )
  if (!localConversation) {
    syncLog.info(conversationId, `本地没有会话, 需要同步`)
    return {
      needSync: true,
      needSyncCount: 0,
      totalCount: 0,
    }
  }
  const localMessages = localConversation?.messages || []
  const hasConversationData = await clientFetchMaxAIAPI<{
    status: string
    data: IConversation[]
  }>('/conversation/get_conversations_basic_by_ids', {
    ids: [conversationId],
  })
  if (hasConversationData.data?.status !== 'OK') {
    syncLog.info(conversationId, `接口报错, 需要同步`)
    return {
      needSync: true,
      needSyncCount: localMessages.length || 0,
      totalCount: localMessages.length || 0,
    }
  }
  // 判断messagesIds是否一致
  const remoteConversationMessagesIdsData = await clientFetchMaxAIAPI<{
    status: string
    data: string[]
  }>('/conversation/get_message_ids', {
    conversation_id: conversationId,
    page_size: 2000,
    sort: 'desc',
  })
  if (remoteConversationMessagesIdsData.data?.status !== 'OK') {
    syncLog.info(conversationId, `接口报错, 需要同步`)
    return {
      needSync: true,
      needSyncCount: localMessages.length || 0,
      totalCount: localMessages.length || 0,
    }
  }
  const remoteConversationMessagesIds =
    remoteConversationMessagesIdsData.data.data || []

  const localConversationMessagesIds = localMessages.map(
    (message) => message.messageId,
  )
  const totalCount = Math.max(
    localConversationMessagesIds.length,
    remoteConversationMessagesIds.length,
  )
  //判断diff
  let diffCount = 0
  // 先对比本地和远程的消息数量
  if (
    localConversationMessagesIds.length !== remoteConversationMessagesIds.length
  ) {
    diffCount = Math.max(
      localConversationMessagesIds.length,
      remoteConversationMessagesIds.length,
    )
  } else {
    // 对比消息的messageId, 此时两个数组长度一定相等，所以只需要diff差异
    for (let i = 0; i < localConversationMessagesIds.length; i++) {
      if (
        remoteConversationMessagesIds.indexOf(
          localConversationMessagesIds[i],
        ) === -1
      ) {
        diffCount++
      }
    }
  }
  syncLog.info(conversationId, diffCount > 0 ? `需要同步` : `不需要同步`)
  return {
    needSync: diffCount > 0,
    needSyncCount: diffCount,
    totalCount,
  }
}

/**
 * 上传本地会话到远程
 * @param conversation
 */
export const uploadClientConversationToRemote = async (
  conversation: IConversation,
) => {
  const result = await clientFetchMaxAIAPI<{
    status: string
  }>('/conversation/upsert_conversation', conversation)
  if (result.data?.status !== 'OK') {
    syncLog.error(conversation.id, `同步失败, 服务器错误`)
    return false
  }
  syncLog.info(conversation.id, `同步成功`)
  return true
}

/**
 * 批量删除远程会话
 * @param type
 */
export const deleteRemoteConversationByType = async (
  type: ISidebarConversationType,
) => {
  // https://dev.maxai.me/conversation/delete_conversation_by_type
  try {
    const result = await clientFetchMaxAIAPI<{
      status: string
    }>('/conversation/delete_conversation_by_type', {
      type,
    })
    if (result.data?.status !== 'OK') {
      syncLog.error(type, `删除失败, 服务器错误`)
      return false
    }
    syncLog.info(type, `删除成功`)
    return true
  } catch (e) {
    syncLog.error(type, `删除失败, 服务器错误`)
    return false
  }
}

/**
 * 同步本地会话到远程
 * @param conversation
 * @param onProgress
 */
export const syncLocalConversationToRemote = async (
  conversation: IConversation,
  onProgress?: (
    progress: {
      current: number
      total: number
      progress: number
      successCount: number
    },
    reason: 'start' | 'progress' | 'end',
  ) => void,
) => {
  let current = 0
  let total = 0
  let successCount = 0
  const generateResult = (
    success: boolean,
    reason: 'start' | 'progress' | 'end',
  ) => {
    const result = {
      success,
      reason,
      current,
      successCount,
      total,
      progress:
        total === 0 ? 0 : Number(((current / total) * 100).toFixed(2)) || 0,
    }
    onProgress?.(result, reason)
    return result
  }
  const needUploadConversation: any = cloneDeep(conversation)
  const localMessagesIds = conversation.messages.map(
    (message) => message.messageId,
  )
  let needUploadMessages: IChatMessage[] = cloneDeep(
    needUploadConversation.messages,
  )
  needUploadMessages = uniqBy(needUploadMessages, 'messageId')
  const conversationId = needUploadConversation.id
  if (!needUploadConversation.authorId) {
    needUploadConversation.authorId = await getMaxAIChromeExtensionUserId()
  }
  syncLog.info(conversationId, `开始同步`)
  generateResult(true, 'start')
  // 消息是分开存的, 需要删除
  delete needUploadConversation.messages
  // 需要上传
  const result = await clientFetchMaxAIAPI<{
    status: string
  }>('/conversation/upsert_conversation', needUploadConversation)
  if (result.data?.status !== 'OK') {
    syncLog.error(conversationId, `同步失败, 服务器错误`)
    return generateResult(false, 'end')
  }
  const remoteMessagesIdsData = await clientFetchMaxAIAPI<{
    status: string
    data: string[]
  }>('/conversation/get_message_ids', {
    conversation_id: conversationId,
    page_size: 2000, // TODO: 2000是一个临时的值，后续需要根据实际情况调整
    sort: 'desc',
  })
  if (remoteMessagesIdsData.data?.status !== 'OK') {
    syncLog.error(conversationId, `同步失败, 服务器错误`)
    return generateResult(false, 'end')
  }
  const remoteMessagesIds = remoteMessagesIdsData.data.data || []
  // 先把remote没有的消息上传
  needUploadMessages = needUploadMessages.filter(
    (message) => !remoteMessagesIds.includes(message.messageId),
  )
  // 计算下载的消息
  const needDownloadMessagesIds = remoteMessagesIds.filter(
    (messageId) => !localMessagesIds.includes(messageId),
  )
  // 这里可以算出来需要上传的消息数量，和本地已经有的消息数量，更新progress
  total = needUploadMessages.length + needDownloadMessagesIds.length
  syncLog.info(conversationId, `需要上传${needUploadMessages.length}条消息`)
  generateResult(true, 'progress')
  // 每次上传10条消息
  const perUploadToRemoteCount = 10
  // 上传消息到remote
  // 上传消息
  for (let i = 0; i < needUploadMessages.length; i += perUploadToRemoteCount) {
    const isUploadSuccess = await clientUploadMessage(
      needUploadMessages.slice(i, i + perUploadToRemoteCount),
      conversationId,
    )
    if (isUploadSuccess) {
      successCount += perUploadToRemoteCount
    }
    current += perUploadToRemoteCount
    syncLog.info(
      conversationId,
      `上传${perUploadToRemoteCount}条消息.${
        isUploadSuccess ? `[成功]` : `[失败]`
      }`,
    )
    generateResult(true, 'progress')
  }
  // 获取remote的Conversation的Messages
  // 下载
  // 每次下载30条消息
  const perDownloadFromRemoteCount = 30
  const addToLocalMessages: IChatMessage[] = []
  const needSyncToLocalDB = needDownloadMessagesIds.length > 0
  syncLog.info(
    conversationId,
    `需要下载${needDownloadMessagesIds.length}条消息`,
    needSyncToLocalDB ? `开始下载到本地` : `不需要下载到本地`,
  )
  for (
    let i = 0;
    i < needDownloadMessagesIds.length;
    i += perDownloadFromRemoteCount
  ) {
    const message_ids = needDownloadMessagesIds.slice(
      i,
      i + perDownloadFromRemoteCount,
    )
    const downloadMessages = await downloadRemoteMessagesToClient(
      conversationId,
      message_ids,
    )
    const isDownloadSuccess = downloadMessages.length === message_ids.length
    if (isDownloadSuccess) {
      successCount += downloadMessages.length
    }
    current += downloadMessages.length
    addToLocalMessages.push(...downloadMessages)
    syncLog.info(
      conversationId,
      `下载${downloadMessages.length}条消息.${
        isDownloadSuccess ? `[成功]` : `[失败]`
      }`,
    )
    generateResult(true, 'progress')
  }
  if (needSyncToLocalDB) {
    syncLog.info(
      conversationId,
      `同步到本地: `,
      addToLocalMessages.length,
      `条消息`,
    )

    const mergeMessages = conversation.messages
      .concat(addToLocalMessages)
      .sort((prev, next) => {
        // 按照时间排序, asc
        const prevTime = prev.created_at
          ? new Date(prev.created_at).getTime()
          : 0
        const nextTime = next.created_at
          ? new Date(next.created_at).getTime()
          : 0
        return prevTime - nextTime
      })
    // await clientUpdateChatConversation(
    //   conversationId,
    //   {
    //     ...conversation,
    //     messages: mergeMessages,
    //   },
    //   false,
    // )
  }
  syncLog.info(
    conversationId,
    `同步完成`,
    `结果: ${successCount === total ? '✅' : '❌'}`,
  )
  return generateResult(successCount === total, 'end')
}
