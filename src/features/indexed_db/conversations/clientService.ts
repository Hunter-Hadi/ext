// server.ts
import cloneDeep from 'lodash-es/cloneDeep'
import uniqBy from 'lodash-es/uniqBy'

import { isEnableSyncConversation } from '@/background/src/chatConversations/conversationToDBHelper'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import { ISidebarConversationType } from '@/features/sidebar/types'
import Log from '@/utils/Log'

const syncLog = new Log('SyncConversation')

/**
 * 上传消息
 * @param conversationId
 * @param messages
 */
export const clientUploadMessagesToRemote = async (
  conversationId: string,
  messages: IChatMessage[],
) => {
  if (!(await isEnableSyncConversation())) {
    return true
  }
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
 * 批量删除message的接口,根据传入的message_ids
 * https://dev.maxai.me/conversation/delete_messages
 * @param conversationId
 * @param messageIds
 */
export const clientDeleteMessagesToRemote = async (
  conversationId: string,
  messageIds: string[],
) => {
  if (!(await isEnableSyncConversation())) {
    return true
  }
  let result = await clientFetchMaxAIAPI<{
    status: string
  }>('/conversation/delete_messages', {
    conversation_id: conversationId,
    message_ids: messageIds,
  })
  // 重试2次
  if (result.data?.status !== 'OK') {
    result = await clientFetchMaxAIAPI<{
      status: string
    }>('/conversation/delete_messages', {
      conversation_id: conversationId,
      message_ids: messageIds,
    })
    if (result.data?.status !== 'OK') {
      result = await clientFetchMaxAIAPI<{
        status: string
      }>('/conversation/delete_messages', {
        conversation_id: conversationId,
        message_ids: messageIds,
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
  if (!(await isEnableSyncConversation())) {
    return []
  }
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
export const clientDownloadConversationToLocal = async (
  conversationId: string,
) => {
  if (!(await isEnableSyncConversation())) {
    return []
  }
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
  return downloadConversationData.data?.data || []
}

/**
 * 分享会话
 * @param conversationId
 * @param enable
 */
export const clientShareConversation = async (
  conversationId: string,
  enable: boolean,
) => {
  try {
    const shareConfig = await clientFetchMaxAIAPI<{
      status: string
      data?: {
        id?: string
      }
    }>('/conversation/share_conversation', {
      id: conversationId,
      share_enabled: enable,
    })
    return shareConfig?.data?.status === 'OK'
      ? {
          enable,
          id: shareConfig.data?.data?.id,
        }
      : null
  } catch (e) {
    return null
  }
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
  if (!(await isEnableSyncConversation())) {
    return {
      needSync: false,
      needSyncCount: 0,
      totalCount: 0,
    }
  }
  const localConversation = await ClientConversationManager.getConversationById(
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
  const localConversationMessagesIds =
    await ClientConversationMessageManager.getMessageIds(conversationId)
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
      needSyncCount: localConversationMessagesIds.length || 0,
      totalCount: localConversationMessagesIds.length || 0,
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
  /**
   * 如果接口报错，或者没有数据，并且本地有数据, 就需要同步
   */
  if (remoteConversationMessagesIdsData.data?.status !== 'OK') {
    syncLog.info(conversationId, `接口报错, 需要同步`)
    return {
      needSync: localConversationMessagesIds.length > 0,
      needSyncCount: localConversationMessagesIds.length || 0,
      totalCount: localConversationMessagesIds.length || 0,
    }
  }
  const remoteConversationMessagesIds =
    remoteConversationMessagesIdsData.data.data || []

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
  if (!(await isEnableSyncConversation())) {
    return true
  }
  const uploadConversation: any = cloneDeep(conversation)
  delete uploadConversation.messages
  const result = await clientFetchMaxAIAPI<{
    status: string
  }>('/conversation/upsert_conversation', uploadConversation)
  if (result.data?.status !== 'OK') {
    syncLog.error(uploadConversation.id, `同步失败, 服务器错误`)
    return false
  }
  syncLog.info(uploadConversation.id, `同步成功`)
  return true
}

/**
 * 批量删除远程会话
 * @param type
 */
export const deleteRemoteConversationByType = async (
  type: ISidebarConversationType,
) => {
  if (!(await isEnableSyncConversation())) {
    return true
  }
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
  if (!(await isEnableSyncConversation())) {
    return true
  }
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
  const localMessagesIds = await ClientConversationMessageManager.getMessageIds(
    conversation.id,
  )
  let needUploadMessages: IChatMessage[] =
    await ClientConversationMessageManager.getMessages(conversation.id)
  needUploadMessages = uniqBy(needUploadMessages, 'messageId')
  const conversationId = needUploadConversation.id
  if (!needUploadConversation.authorId) {
    needUploadConversation.authorId = await getMaxAIChromeExtensionUserId()
  }
  syncLog.info(conversationId, `开始同步`)
  generateResult(true, 'start')
  // 需要上传
  const isUploadConversationSuccess = await uploadClientConversationToRemote(
    needUploadConversation,
  )
  if (!isUploadConversationSuccess) {
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
  let needDownloadMessagesIds = remoteMessagesIds.filter(
    (messageId) => !localMessagesIds.includes(messageId),
  )
  // 这里可以算出来需要上传的消息数量，和本地已经有的消息数量，更新progress
  total = needUploadMessages.length + needDownloadMessagesIds.length
  syncLog.info(conversationId, `需要上传${needUploadMessages.length}条消息`)
  generateResult(true, 'progress')
  // 每次上传30条消息
  const perUploadToRemoteCount = 30
  // 上传消息到remote
  // 上传消息
  for (let i = 0; i < needUploadMessages.length; i += perUploadToRemoteCount) {
    const isUploadSuccess = await clientUploadMessagesToRemote(
      conversationId,
      needUploadMessages.slice(i, i + perUploadToRemoteCount),
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
  // NOTE: !!因为聊天记录是分页加载的，所以在渲染的时候会自动下载同步到本地
  // 所以这里设置为[]，不需要在这个auto Sync阶段下载
  // 只上传服务器没有的消息就行
  needDownloadMessagesIds = []
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
    await ClientConversationMessageManager.addMessages(
      conversationId,
      addToLocalMessages,
    )
  }
  syncLog.info(
    conversationId,
    `同步完成`,
    `结果: ${successCount === total ? '✅' : '❌'}`,
  )
  return generateResult(successCount === total, 'end')
}
