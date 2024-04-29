import cloneDeep from 'lodash-es/cloneDeep'
import orderBy from 'lodash-es/orderBy'
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

const checkConversationNeedSync = async (conversation: IChatConversation) => {
  const hasConversationData = await clientFetchMaxAIAPI<{
    status: string
    data: IChatConversation[]
  }>('/conversation/get_conversations_basic_by_ids', {
    ids: [conversation.id],
  })
  if (hasConversationData.data?.status !== 'OK') {
    return {
      needSync: true,
      needSyncCount: conversation.messages.length,
    }
  }
  // 判断messagesIds是否一致
  const remoteConversationMessagesIdsData = await clientFetchMaxAIAPI<{
    status: string
    data: string[]
  }>('/conversation/get_message_ids', {
    conversation_id: conversation.id,
    page_size: 50,
    sort: 'desc',
  })
  if (remoteConversationMessagesIdsData.data?.status !== 'OK') {
    return {
      needSync: true,
      needSyncCount: conversation.messages.length,
    }
  }
  const remoteConversationMessagesIds =
    remoteConversationMessagesIdsData.data.data || []
  //判断diff
  let diffCount = 0
  const localConversationMessagesIds = conversation.messages.map(
    (message) => message.messageId,
  )
  //如果远程的消息比本地的多，那么就是需要同步的
  if (
    remoteConversationMessagesIds.length > localConversationMessagesIds.length
  ) {
    for (const remoteMessageId of remoteConversationMessagesIds) {
      if (!localConversationMessagesIds.includes(remoteMessageId)) {
        diffCount++
      }
    }
  } else {
    // 如果本地的消息比远程的多，那么就是需要同步的
    for (const localMessageId of localConversationMessagesIds) {
      if (!remoteConversationMessagesIds.includes(localMessageId)) {
        diffCount++
      }
    }
  }
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
  generateResult(true, 'start')
  // 消息是分开存的, 需要删除
  delete needUploadConversation.messages
  // 需要上传
  const result = await clientFetchMaxAIAPI<{
    status: string
  }>('/conversation/upsert_conversation', needUploadConversation)
  if (result.data?.status !== 'OK') {
    debugger
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
    debugger
    return generateResult(false, 'end')
  }
  debugger
  const remoteMessagesIds = remoteMessagesIdsData.data.data || []
  // 先把remote没有的消息上传
  needUploadMessages = needUploadMessages.filter(
    (message) => !remoteMessagesIds.includes(message.messageId),
  )
  const needUploadMessagesIds = needUploadMessages.map(
    (message) => message.messageId,
  )
  // 这里可以算出来需要上传的消息数量，和本地已经有的消息数量，更新progress
  total = needUploadMessages.length + remoteMessagesIds.length
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
  debugger
  const perDownloadFromRemoteCount = 30
  const needDownloadMessagesIds = remoteMessagesIds.filter(
    (messageId) => !localMessagesIds.includes(messageId),
  )
  let page = 0
  for (
    let i = 0;
    i < needDownloadMessagesIds.length;
    i += perDownloadFromRemoteCount
  ) {
    // const remoteMessagesData = await clientFetchMaxAIAPI<{
    //   status: string
    //   data: IChatMessage[]
    // }>('/conversation/get_messages', {
    //   conversation_id: conversationId,
    //   message_ids: needDownloadMessagesIds.slice(
    //     i,
    //     i + perDownloadFromRemoteCount,
    //   ),
    // })
    const remoteMessagesData = await clientFetchMaxAIAPI<{
      status: string
      data: IChatMessage[]
    }>('/conversation/get_messages', {
      conversation_id: conversationId,
      page,
      page_size: perDownloadFromRemoteCount,
    })
    page++
    const remoteMessages = remoteMessagesData.data?.data || []
    if (remoteMessages.length > 0) {
      successCount += remoteMessages.length
    }
    current += remoteMessages.length || 0
    generateResult(true, 'progress')
  }
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
        set(ConversationSyncGlobalState, {
          activeConversationId: '',
          syncConversationStatus: SyncStatus.Uploading,
          syncConversationStep: 0,
          syncSuccessConversationCount: 0,
          syncTotalConversationCount: conversationIds.length,
        })
        let successCount = 0
        let errorCount = 0
        for (const conversationId of conversationIds) {
          try {
            set(ConversationSyncGlobalState, (prev) => {
              return {
                ...prev,
                syncConversationStep: prev.syncConversationStep + 1,
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
            const localConversation = await clientGetConversation(
              conversationId,
            )
            let remoteConversation: IChatConversation | null = null
            const remoteConversationData = await clientFetchMaxAIAPI<{
              status: string
              data: IChatConversation[]
            }>('/conversation/get_conversation', {
              id: conversationId,
            })
            if (remoteConversationData.data?.data?.[0]) {
              remoteConversation = remoteConversationData.data.data[0]
              const remoteConversationMessagesData = await clientFetchMaxAIAPI<{
                status: string
                data: IChatMessage[]
              }>('/conversation/get_messages', {
                conversation_id: conversationId,
              })
              remoteConversation.messages =
                remoteConversationMessagesData.data?.data || []
            }
            let finallySaveConversation: IChatConversation | null = null
            let needSyncToRemote = false
            if (!localConversation && !remoteConversation) {
              errorCount++
              set(ConversationSyncStateFamily(conversationId), (prev) => {
                return {
                  ...prev,
                  syncStatus: SyncStatus.Error,
                }
              })
              continue
            } else if (!localConversation && remoteConversation) {
              successCount++
              finallySaveConversation = remoteConversation
              // 不需要同步了，因为本地没有
              await clientUpdateChatConversation(
                remoteConversation.id,
                {
                  ...remoteConversation,
                  messages: remoteConversation.messages,
                },
                false,
              )
              set(ConversationSyncStateFamily(conversationId), (prev) => {
                return {
                  ...prev,
                  syncStep: remoteConversation!.messages.length,
                  syncTotalCount: remoteConversation!.messages.length,
                }
              })
              await wait(1000)
              continue
            } else if (localConversation && !remoteConversation) {
              finallySaveConversation = localConversation
              set(ConversationSyncStateFamily(conversationId), (prev) => {
                return {
                  ...prev,
                  syncStep: localConversation!.messages.length,
                  syncTotalCount: localConversation!.messages.length,
                }
              })
              needSyncToRemote = true
              await wait(1000)
            } else if (localConversation && remoteConversation) {
              // 比较消息
              const messageMap: Map<string, IChatMessage> = new Map()
              // 先把remote都放进去
              for (const remoteMessage of remoteConversation.messages) {
                messageMap.set(remoteMessage.messageId, remoteMessage)
              }
              // 再比较本地
              for (const localMessage of localConversation.messages) {
                const remoteMessage = messageMap.get(localMessage.messageId)
                // 如果remote没有，直接放进去
                if (!remoteMessage) {
                  messageMap.set(localMessage.messageId, localMessage)
                  needSyncToRemote = true
                } else {
                  // 如果remote有，比较updated_at
                  // 比较updated_at
                  const remoteMessageUpdatedAt = remoteMessage.updated_at
                  const localMessageUpdatedAt = localMessage.updated_at
                  // 如果remote没有，直接覆盖
                  if (!remoteMessageUpdatedAt) {
                    messageMap.set(localMessage.messageId, remoteMessage)
                  } else if (!localMessageUpdatedAt) {
                    // 如果本地没有，直接跳过
                  } else if (localMessageUpdatedAt && remoteMessageUpdatedAt) {
                    // 如果本地的更新时间比远程的新，覆盖
                    if (
                      new Date(localMessageUpdatedAt).getTime() >
                      new Date(remoteMessageUpdatedAt).getTime()
                    ) {
                      needSyncToRemote = true
                      messageMap.set(remoteMessage.messageId, remoteMessage)
                    }
                  }
                }
              }
              finallySaveConversation = cloneDeep(remoteConversation)
              finallySaveConversation.messages = orderBy(
                Array.from(messageMap.values()),
                (message) =>
                  message.updated_at
                    ? new Date(message.updated_at).getTime()
                    : 0,
                'asc',
              )
              needSyncToRemote = true
              if (finallySaveConversation) {
                if (!needSyncToRemote) {
                  set(ConversationSyncStateFamily(conversationId), (prev) => {
                    return {
                      ...prev,
                      syncStep: finallySaveConversation!.messages.length,
                      syncTotalCount: finallySaveConversation!.messages.length,
                      syncStatus: SyncStatus.Success,
                    }
                  })
                  await wait(1000)
                  continue
                }
                set(ConversationSyncStateFamily(conversationId), (prev) => {
                  return {
                    ...prev,
                    syncTotalCount: finallySaveConversation!.messages.length,
                  }
                })
              }
            } else {
              errorCount++
              set(ConversationSyncStateFamily(conversationId), (prev) => {
                return {
                  ...prev,
                  syncStatus: SyncStatus.Error,
                }
              })
              continue
            }
            if (finallySaveConversation) {
              debugger
              const { success } = await syncLocalConversationToRemote(
                finallySaveConversation,
              )
              if (success) {
                successCount++
              } else {
                errorCount++
              }
              set(ConversationSyncStateFamily(conversationId), (prev) => {
                return {
                  ...prev,
                  syncStatus: success ? SyncStatus.Success : SyncStatus.Error,
                  syncSuccessCount: finallySaveConversation!.messages.length,
                }
              })
            } else {
              errorCount++
              set(ConversationSyncStateFamily(conversationId), {
                syncStatus: SyncStatus.Error,
                syncSuccessCount: 0,
                syncTotalCount: 0,
                syncStep: 0,
              })
            }
          } catch (e) {
            console.error(e)
            set(ConversationSyncStateFamily(conversationId), {
              syncStatus: SyncStatus.Error,
              syncSuccessCount: 0,
              syncTotalCount: 0,
              syncStep: 0,
            })
          }
        }
        return {
          success: errorCount === 0,
          successCount,
          errorCount,
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
        const checkResult = await checkConversationNeedSync(localConversation)
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
