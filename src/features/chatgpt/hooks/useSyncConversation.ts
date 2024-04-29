import cloneDeep from 'lodash-es/cloneDeep'
import { useTranslation } from 'react-i18next'
import { atom, atomFamily, useRecoilCallback, useRecoilValue } from 'recoil'

import { IChatConversation } from '@/background/src/chatConversations'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IChatMessage } from '@/features/chatgpt/types'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import { clientUpdateChatConversation } from '@/features/chatgpt/utils/clientChatConversation'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import { wait } from '@/utils'
import Log from '@/utils/Log'

enum SyncStatus {
  Idle = 'idle',
  Uploading = 'uploading',
  Error = 'error',
  Success = 'success',
}

const ConversationSyncGlobalState = atom<{
  activeConversationId: string
  syncSuccessConversationCount: number
  syncTotalConversationCount: number
  syncConversationStep: number
  syncConversationStatus: SyncStatus
}>({
  key: 'ConversationSyncGlobalState',
  default: {
    activeConversationId: '',
    syncConversationStep: 0,
    syncSuccessConversationCount: 0,
    syncTotalConversationCount: 0,
    syncConversationStatus: SyncStatus.Idle,
  },
})

const ConversationSyncStateFamily = atomFamily<
  {
    syncStatus: SyncStatus
    syncStep: number
    syncSuccessCount: number
    syncTotalCount: number
  },
  string
>({
  key: 'ConversationSyncStateFamily',
  default: {
    syncStatus: SyncStatus.Idle,
    syncStep: 0,
    syncSuccessCount: 0,
    syncTotalCount: 0,
  },
})
const ConversationAutoSyncStateFamily = atomFamily<
  {
    autoSyncStatus: SyncStatus
    autoSyncStep: number
    autoSyncSuccessCount: number
    autoSyncTotalCount: number
  },
  string
>({
  key: 'ConversationAutoSyncStateFamily',
  default: {
    autoSyncStatus: SyncStatus.Idle,
    autoSyncStep: 0,
    autoSyncSuccessCount: 0,
    autoSyncTotalCount: 0,
  },
})

const syncLog = new Log('SyncConversation')

const clientUploadMessage = async (
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

const checkConversationNeedSync = async (conversationId: string) => {
  const localConversation = await clientGetConversation(conversationId)
  if (!localConversation) {
    syncLog.info(conversationId, `本地没有会话, 需要同步`)
    return {
      needSync: true,
      needSyncCount: 0,
    }
  }
  const localMessages = localConversation?.messages || []
  const hasConversationData = await clientFetchMaxAIAPI<{
    status: string
    data: IChatConversation[]
  }>('/conversation/get_conversations_basic_by_ids', {
    ids: [conversationId],
  })
  if (hasConversationData.data?.status !== 'OK') {
    syncLog.info(conversationId, `接口报错, 需要同步`)
    return {
      needSync: true,
      needSyncCount: localMessages.length || 0,
    }
  }
  // 判断messagesIds是否一致
  const remoteConversationMessagesIdsData = await clientFetchMaxAIAPI<{
    status: string
    data: string[]
  }>('/conversation/get_message_ids', {
    conversation_id: conversationId,
    page_size: 50,
    sort: 'desc',
  })
  if (remoteConversationMessagesIdsData.data?.status !== 'OK') {
    syncLog.info(conversationId, `接口报错, 需要同步`)
    return {
      needSync: true,
      needSyncCount: localMessages.length || 0,
    }
  }
  const remoteConversationMessagesIds =
    remoteConversationMessagesIdsData.data.data || []
  //判断diff
  let diffCount = 0
  const localConversationMessagesIds = localMessages.map(
    (message) => message.messageId,
  )
  //如果远程的消息比本地的多，那么看看远程是不是都有本地的
  if (
    remoteConversationMessagesIds.length > localConversationMessagesIds.length
  ) {
    for (const localMessageId of localConversationMessagesIds) {
      if (!remoteConversationMessagesIds.includes(localMessageId)) {
        diffCount++
      }
    }
  } else {
    // 如果本地的消息比远程的多，那么看看本地是不是都有远程的
    for (const remoteMessageId of remoteConversationMessagesIds) {
      if (!localConversationMessagesIds.includes(remoteMessageId)) {
        diffCount++
      }
    }
  }
  syncLog.info(conversationId, diffCount > 0 ? `需要同步` : `不需要同步`)
  return {
    needSync: diffCount > 0,
    needSyncCount: diffCount,
  }
}

const syncLocalConversationToRemote = async (
  conversation: IChatConversation,
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
  // 这里可以算出来需要上传的消息数量，和本地已经有的消息数量，更新progress
  total = needUploadMessages.length + remoteMessagesIds.length
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
    generateResult(true, 'progress')
  }
  // 获取remote的Conversation的Messages
  // 下载
  // 每次下载30条消息
  const perDownloadFromRemoteCount = 30
  const needDownloadMessagesIds = remoteMessagesIds.filter(
    (messageId) => !localMessagesIds.includes(messageId),
  )
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
    const downloadMessagesData = await clientFetchMaxAIAPI<{
      status: string
      data: IChatMessage[]
    }>('/conversation/batch_get_message_by_id', {
      conversation_id: conversationId,
      message_ids,
    })
    const downloadMessages = downloadMessagesData.data?.data || []
    const isDownloadSuccess = downloadMessages.length === message_ids.length
    if (!isDownloadSuccess) {
      successCount++
    }
    current += downloadMessages.length || 0
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
    await clientUpdateChatConversation(
      conversationId,
      {
        ...conversation,
        messages: mergeMessages,
      },
      false,
    )
  }
  syncLog.info(conversationId, `同步完成`, `结果:${successCount === total}`)
  return generateResult(successCount === total, 'end')
}

export const useSyncConversation = () => {
  const { t } = useTranslation(['client'])
  const { currentConversationId } = useClientConversation()
  const conversationSyncGlobalState = useRecoilValue(
    ConversationSyncGlobalState,
  )
  const conversationSyncState = useRecoilValue(
    ConversationSyncStateFamily(
      conversationSyncGlobalState.activeConversationId,
    ),
  )
  const conversationAutoSyncState = useRecoilValue(
    ConversationAutoSyncStateFamily(currentConversationId || ''),
  )
  const syncConversationsByIds = useRecoilCallback(
    ({ set }) =>
      async (conversationIds: string[]) => {
        syncLog.info(`开始Sync全部会话`, conversationIds.length, `个`)
        let step = 0
        let successCount = 0
        const totalCount = conversationIds.length
        set(ConversationSyncGlobalState, {
          activeConversationId: '',
          syncConversationStatus: SyncStatus.Uploading,
          syncConversationStep: 0,
          syncSuccessConversationCount: 0,
          syncTotalConversationCount: conversationIds.length,
        })
        for (const conversationId of conversationIds) {
          try {
            step++
            syncLog.info(conversationId, `开始同步第`, `${step}个`)
            set(ConversationSyncGlobalState, (prev) => {
              return {
                ...prev,
                syncConversationStep: step,
                activeConversationId: conversationId,
              }
            })
            set(ConversationSyncStateFamily(conversationId), (prev) => {
              return {
                ...prev,
                syncStatus: SyncStatus.Uploading,
                syncStep: 0,
                syncSuccessCount: 0,
                syncTotalCount: 0,
              }
            })
            //获取本地会话
            let localConversation = await clientGetConversation(conversationId)
            if (!localConversation) {
              syncLog.info(
                conversationId,
                `获取本地会话失败, 从后端伪造一个本地的`,
              )
              const remoteConversationData = await clientFetchMaxAIAPI<{
                status: string
                data: IChatConversation[]
              }>('/conversation/get_conversation', {
                id: conversationId,
              })
              if (
                remoteConversationData.data?.status === 'OK' &&
                remoteConversationData.data?.data?.[0]?.id === conversationId
              ) {
                localConversation = remoteConversationData.data.data[0]
                localConversation.messages = []
              }
            }
            if (!localConversation) {
              syncLog.error(conversationId, `获取本地会话失败`)
              set(ConversationSyncStateFamily(conversationId), (prev) => {
                return {
                  ...prev,
                  syncStatus: SyncStatus.Error,
                }
              })
              continue
            }
            const checkResult = await checkConversationNeedSync(conversationId)
            if (!checkResult.needSync) {
              successCount++
              set(ConversationSyncStateFamily(conversationId), (prev) => {
                return {
                  ...prev,
                  syncStatus: SyncStatus.Success,
                }
              })
              continue
            } else {
              set(ConversationSyncStateFamily(conversationId), (prev) => {
                return {
                  ...prev,
                  syncStatus: SyncStatus.Uploading,
                  syncStep: 0,
                  syncSuccessCount: 0,
                  syncTotalCount: checkResult.needSyncCount,
                }
              })
            }
            await syncLocalConversationToRemote(
              localConversation,
              (progress, reason) => {
                const syncState = {
                  syncStatus: SyncStatus.Uploading,
                  syncStep: progress.current,
                  syncTotalCount: progress.total,
                  syncSuccessCount: progress.successCount,
                }
                if (reason === 'end') {
                  syncState.syncStatus =
                    progress.successCount === progress.total
                      ? SyncStatus.Success
                      : SyncStatus.Error
                  if (syncState.syncStatus === SyncStatus.Success) {
                    successCount++
                  }
                }
                set(ConversationSyncStateFamily(conversationId), syncState)
              },
            )
          } catch (e) {
            console.error(e)
          }
        }
        syncLog.info(
          `Sync全部会话完成`,
          `成功${successCount}个`,
          `总共${totalCount}个`,
        )
        set(ConversationSyncGlobalState, (prev) => {
          return {
            ...prev,
            syncSuccessConversationCount: successCount,
            syncConversationStatus:
              successCount === totalCount
                ? SyncStatus.Success
                : SyncStatus.Error,
          }
        })
        return {
          success: totalCount === successCount,
          successCount,
          totalCount,
        }
      },
    [],
  )
  const autoSyncConversation = useRecoilCallback(
    ({ set, snapshot }) =>
      async (conversationId: string) => {
        if (!conversationId) {
          return
        }
        const localConversation = await clientGetConversation(conversationId)
        if (!localConversation || localConversation.messages.length === 0) {
          return
        }
        const syncState = await snapshot.getPromise(
          ConversationAutoSyncStateFamily(conversationId),
        )
        if (
          syncState.autoSyncStatus === SyncStatus.Uploading ||
          syncState.autoSyncStatus === SyncStatus.Success
        ) {
          return
        }
        // 上传会话和消息
        const checkResult = await checkConversationNeedSync(
          localConversation.id,
        )
        if (!checkResult.needSync) {
          set(ConversationAutoSyncStateFamily(conversationId), (prev) => {
            return {
              ...prev,
              autoSyncStatus: SyncStatus.Success,
            }
          })
          return
        }
        set(ConversationAutoSyncStateFamily(conversationId), {
          autoSyncStatus: SyncStatus.Uploading,
          autoSyncStep: 0,
          autoSyncSuccessCount: 0,
          autoSyncTotalCount: checkResult.needSyncCount,
        })
        await syncLocalConversationToRemote(
          localConversation,
          (progress, reason) => {
            set(ConversationAutoSyncStateFamily(conversationId), (prev) => {
              let autoSyncStatus = SyncStatus.Uploading
              if (reason === 'end') {
                autoSyncStatus =
                  progress.successCount === progress.total
                    ? SyncStatus.Success
                    : SyncStatus.Error
              }
              return {
                ...prev,
                autoSyncStatus,
                autoSyncStep: progress.current,
                autoSyncSuccessCount: progress.current,
                autoSyncTotalCount: progress.total,
              }
            })
          },
        )
        await wait(1000)
      },
    [t],
  )
  return {
    conversationAutoSyncState,
    conversationSyncState,
    conversationSyncGlobalState,
    syncConversationsByIds,
    autoSyncConversation,
  }
}
export default useSyncConversation
