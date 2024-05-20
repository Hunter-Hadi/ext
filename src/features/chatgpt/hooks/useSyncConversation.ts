import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  atom,
  atomFamily,
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil'

import { clientGetMaxAIBetaFeatureSettings } from '@/background/utils/maxAIBetaFeatureSettings/client'
import { useAuthLogin } from '@/features/auth'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import {
  checkConversationNeedSync,
  syncLocalConversationToRemote,
} from '@/features/indexed_db/conversations/clientService'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
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
  loaded: boolean
  enabled: boolean
}>({
  key: 'ConversationSyncGlobalState',
  default: {
    activeConversationId: '',
    syncConversationStep: 0,
    syncSuccessConversationCount: 0,
    syncTotalConversationCount: 0,
    syncConversationStatus: SyncStatus.Idle,
    loaded: false,
    enabled: false,
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

export const useSyncConversation = () => {
  const { t } = useTranslation(['client'])
  const { currentConversationId } = useClientConversation()
  const [conversationSyncGlobalState, setConversationSyncGlobalState] =
    useRecoilState(ConversationSyncGlobalState)
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
        set(ConversationSyncGlobalState, (prev) => {
          return {
            ...prev,
            activeConversationId: '',
            syncConversationStatus: SyncStatus.Uploading,
            syncConversationStep: 0,
            syncSuccessConversationCount: 0,
            syncTotalConversationCount: conversationIds.length,
          }
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
            let localConversation =
              await ClientConversationManager.getConversation(conversationId)
            if (!localConversation) {
              syncLog.info(
                conversationId,
                `获取本地会话失败, 从后端伪造一个本地的`,
              )
              const remoteConversationData = await clientFetchMaxAIAPI<{
                status: string
                data: IConversation[]
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
                  syncStep: checkResult.totalCount,
                  syncTotalCount: checkResult.totalCount,
                }
              })
              await wait(500)
              continue
            } else {
              set(ConversationSyncStateFamily(conversationId), (prev) => {
                return {
                  ...prev,
                  syncStatus: SyncStatus.Uploading,
                  syncStep: 0,
                  syncSuccessCount: 0,
                  syncTotalCount: checkResult.totalCount,
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
        const localConversation =
          await ClientConversationManager.getConversation(conversationId)
        if (!localConversation) {
          return
        }
        const syncState = await snapshot.getPromise(
          ConversationAutoSyncStateFamily(conversationId),
        )
        syncLog.info(conversationId, `开始自动同步`)
        if (
          syncState.autoSyncStatus === SyncStatus.Uploading ||
          syncState.autoSyncStatus === SyncStatus.Success
        ) {
          syncLog.info(
            conversationId,
            `正在同步中, 请稍后`,
            syncState.autoSyncStatus,
          )
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
              autoSyncStatus: SyncStatus.Idle,
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
              return {
                ...prev,
                autoSyncStatus:
                  reason === 'end' ? SyncStatus.Idle : SyncStatus.Uploading,
                autoSyncStep: progress.current,
                autoSyncSuccessCount: progress.current,
                autoSyncTotalCount: progress.total,
              }
            })
          },
        )
        await wait(500)
      },
    [t],
  )
  const resetConversationSyncGlobalState = () => {
    setConversationSyncGlobalState((prev) => {
      return {
        ...prev,
        activeConversationId: '',
        syncConversationStep: 0,
        syncSuccessConversationCount: 0,
        syncTotalConversationCount: 0,
        syncConversationStatus: SyncStatus.Idle,
      }
    })
  }

  return {
    conversationAutoSyncState,
    conversationSyncState,
    conversationSyncGlobalState,
    syncConversationsByIds,
    autoSyncConversation,
    resetConversationSyncGlobalState,
    enabled: conversationSyncGlobalState.enabled,
    loaded: conversationSyncGlobalState.loaded,
  }
}
export const useInitSyncConversation = () => {
  const setConversationSyncGlobalState = useSetRecoilState(
    ConversationSyncGlobalState,
  )
  const { isLogin, loaded } = useAuthLogin()
  useEffect(() => {
    if (!loaded) {
      return
    }
    if (isLogin) {
      clientGetMaxAIBetaFeatureSettings().then((settings) => {
        setConversationSyncGlobalState((prev) => {
          return {
            ...prev,
            loaded: true,
            enabled: settings.chat_sync,
          }
        })
      })
    } else {
      setConversationSyncGlobalState((prev) => {
        return {
          ...prev,
          loaded: true,
          enabled: false,
        }
      })
    }
  }, [isLogin, loaded])
}
export default useSyncConversation
