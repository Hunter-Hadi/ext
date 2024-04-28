import cloneDeep from 'lodash-es/cloneDeep'
import orderBy from 'lodash-es/orderBy'
import { useTranslation } from 'react-i18next'
import { atom, atomFamily, useRecoilCallback, useRecoilValue } from 'recoil'

import { IChatConversation } from '@/background/src/chatConversations'
import { IChatMessage } from '@/features/chatgpt/types'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import { clientUpdateChatConversation } from '@/features/chatgpt/utils/clientChatConversation'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import globalSnackbar from '@/utils/globalSnackbar'

const ConversationSyncGlobalState = atom<{
  activeConversationId: string
  syncSuccessConversationCount: number
  syncTotalConversationCount: number
  syncStep: number
  syncStatus: 'idle' | 'uploading' | 'error' | 'success'
}>({
  key: 'ConversationSyncGlobalState',
  default: {
    activeConversationId: '',
    syncStep: 0,
    syncSuccessConversationCount: 0,
    syncTotalConversationCount: 0,
    syncStatus: 'idle',
  },
})

const ConversationSyncStateFamily = atomFamily<
  {
    autoSyncStatus: 'idle' | 'uploading' | 'error' | 'success'
    autoSyncSuccessCount: number
    autoSyncTotalCount: number
  },
  string
>({
  key: 'ConversationSyncStateFamily',
  default: {
    autoSyncStatus: 'idle',
    autoSyncSuccessCount: 0,
    autoSyncTotalCount: 0,
  },
})

const syncLocalConversationToRemote = async (
  conversation: IChatConversation,
) => {
  const needUploadConversation: any = cloneDeep(localConversation)
  const needUploadMessages = cloneDeep(needUploadConversation.messages)
  // 消息是分开存的, 需要删除
  delete needUploadConversation.messages
  // 需要上传
  const result = await clientFetchMaxAIAPI<{
    status: string
  }>('/conversation/upsert_conversation', needUploadConversation)
  if (result.data?.status !== 'OK') {
    return {
      success: false,
      successCount: 0,
    }
  }
  // 上传消息
  // 每次上传30条消息
  const perUploadCount = 30
  const messageChunks = []
  let successCount = 0

  for (let i = 0; i < needUploadMessages.length; i += perUploadCount) {
    messageChunks.push(needUploadMessages.slice(i, i + perUploadCount))
  }
  for (const messageChunk of messageChunks) {
    let result = await clientFetchMaxAIAPI<{
      status: string
    }>('/conversation/add_messages', {
      conversation_id: conversationId,
      messages: messageChunk,
    })
    // 重试2次
    if (result.data?.status !== 'OK') {
      result = await clientFetchMaxAIAPI<{
        status: string
      }>('/conversation/add_messages', {
        conversation_id: conversationId,
        messages: messageChunk,
      })
      if (result.data?.status !== 'OK') {
        result = await clientFetchMaxAIAPI<{
          status: string
        }>('/conversation/add_messages', {
          conversation_id: conversationId,
          messages: messageChunk,
        })
      }
    }
    if (result.data?.status !== 'OK') {
      return {
        success: false,
        successCount: 0,
      }
    } else {
      successCount += messageChunk.length
    }
  }
  return {
    success: true,
    successCount,
  }
}

export const useSyncConversation = () => {
  const { t } = useTranslation(['client'])
  const conversationSyncGlobalState = useRecoilValue(
    ConversationSyncGlobalState,
  )
  const conversationSyncState = useRecoilValue(
    ConversationSyncStateFamily(
      conversationSyncGlobalState.activeConversationId,
    ),
  )
  const syncConversationsByIds = useRecoilCallback(
    ({ set }) =>
      async (conversationIds: string[]) => {
        set(ConversationSyncGlobalState, {
          syncStatus: 'uploading',
          syncStep: 0,
          syncSuccessConversationCount: 0,
          syncTotalConversationCount: conversationIds.length,
        })
        let successCount = 0
        let errorCount = 0
        for (const conversationId of conversationIds) {
          try {
            set(ConversationSyncGlobalState, (oldState) => {
              return {
                ...oldState,
                syncStep: oldState.syncStep + 1,
                activeConversationId: conversationId,
              }
            })
            set(ConversationSyncStateFamily(conversationId), {
              autoSyncStatus: 'uploading',
              autoSyncSuccessCount: 0,
              autoSyncTotalCount: 0,
            })
            //获取本地会话
            const localConversation = await clientGetConversation(
              conversationId,
            )
            const remoteConversationData = await clientFetchMaxAIAPI<{
              status: string
              data: {
                status: string
                data: IChatConversation[]
              }
            }>('/conversation/get_conversation', {
              id: conversationId,
            })
            const remoteConversationMessagesData = await clientFetchMaxAIAPI<{
              status: string
              data: {
                status: string
                data: IChatMessage[]
              }
            }>('/conversation/get_messages', {
              conversation_id: conversationId,
            })
            if (remoteConversationMessagesData.data?.status !== 'OK') {
              errorCount++
              set(ConversationSyncStateFamily(conversationId), {
                autoSyncStatus: 'error',
                syncSuccessConversationCount: 0,
                syncTotalConversationCount: 0,
              })
              continue
            }
            const remoteConversationMessages =
              remoteConversationMessagesData.data?.data || []
            const remoteConversation: IChatConversation =
              remoteConversationData.data?.data?.[0] || null
            let finallySaveConversation: IChatConversation | null = null
            if (!localConversation && !remoteConversation) {
              errorCount++
              set(ConversationSyncStateFamily(conversationId), {
                autoSyncStatus: 'error',
                syncSuccessConversationCount: 0,
                syncTotalConversationCount: 0,
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
                  messages: remoteConversationMessages,
                },
                false,
              )
              set(ConversationSyncStateFamily(conversationId), {
                autoSyncStatus: 'success',
                syncSuccessConversationCount: successCount,
                syncTotalConversationCount: remoteConversationMessages,
              })
              continue
            } else if (localConversation && !remoteConversation) {
              finallySaveConversation = localConversation
            } else {
              // 比较消息
              const messageMap: Map<string, IChatMessage> = new Map()
              for (const localMessage of localConversation.messages) {
                messageMap.set(localMessage.id, localMessage)
              }
              for (const remoteMessage of remoteConversation.messages) {
                if (!messageMap.has(remoteMessage.id)) {
                  localConversation.messages.push(remoteMessage)
                } else {
                  // 比较updated_at
                  const localMessageUpdatedAt = new Date(
                    messageMap.get(remoteMessage.id).updated_at,
                  )
                  const remoteMessageUpdatedAt = new Date(
                    remoteMessage.updated_at,
                  )
                  if (remoteMessageUpdatedAt > localMessageUpdatedAt) {
                    messageMap.set(remoteMessage.id, remoteMessage)
                  }
                }
              }
              finallySaveConversation = cloneDeep(remoteConversation)
              if (finallySaveConversation) {
                finallySaveConversation.messages = orderBy(
                  Array.from(messageMap.values()),
                  (message) => new Date(message.updated_at),
                  'asc',
                )
              }
            }
            if (finallySaveConversation) {
              const { success } = await syncLocalConversationToRemote(
                finallySaveConversation,
              )
              if (success) {
                successCount++
              } else {
                errorCount++
              }
              set(ConversationSyncStateFamily(conversationId), {
                autoSyncStatus: success ? 'success' : 'error',
                autoSyncSuccessCount: finallySaveConversation.messages.length,
              })
            } else {
              errorCount++
              set(ConversationSyncStateFamily(conversationId), {
                autoSyncStatus: 'error',
                syncSuccessConversationCount: 0,
                syncTotalConversationCount: 0,
              })
            }
          } catch (e) {
            console.error(e)
            set(ConversationSyncStateFamily(conversationId), {
              autoSyncStatus: 'error',
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
        set(ConversationSyncGlobalState, {
          activeConversationId: conversationId,
        })
        const syncState = await snapshot.getPromise(
          ConversationSyncStateFamily(conversationId),
        )
        if (
          syncState.autoSyncStatus === 'uploading' ||
          syncState.autoSyncStatus === 'success'
        ) {
          return
        }
        const errorTips = () => {
          globalSnackbar.error(
            t('client:sidebar__conversation_share__share_panel__error_tip'),
            {
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            },
          )
        }
        // 上传会话和消息
        let hasConversation = false
        // 获取最新的消息
        const hasConversationData = await clientFetchMaxAIAPI<{
          status: string
          data: {
            status: string
            data: IChatConversation[]
          }
        }>('/conversation/get_conversations_basic_by_ids', {
          ids: [localConversation.id],
        })
        if (hasConversationData.data?.status === 'OK') {
          if (hasConversationData.data.data.length > 0) {
            hasConversation = true
          }
        }
        if (hasConversation) {
          // TODO 其实还需要比较消息是否一致
          set(ConversationSyncStateFamily(conversationId), {
            autoSyncStatus: 'success',
          })
          return
        }
        set(ConversationSyncStateFamily(conversationId), {
          autoSyncStatus: 'uploading',
          autoSyncSuccessCount: 0,
          autoSyncTotalCount: localConversation.messages.length,
        })
        const { success, successCount } = await syncLocalConversationToRemote(
          localConversation,
        )
        set(ConversationSyncStateFamily(conversationId), {
          autoSyncStatus: success ? 'success' : 'error',
          autoSyncSuccessCount: successCount,
        })
      },
    [t],
  )
  return {
    conversationSyncState,
    conversationSyncGlobalState,
    syncConversationsByIds,
    autoSyncConversation,
  }
}
export default useSyncConversation
