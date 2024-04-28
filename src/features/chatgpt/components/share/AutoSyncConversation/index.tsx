import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import cloneDeep from 'lodash-es/cloneDeep'
import React, { FC, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { atomFamily, useRecoilState } from 'recoil'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import globalSnackbar from '@/utils/globalSnackbar'

const ConversationSyncStateFamily = atomFamily<
  {
    autoSyncStatus: 'idle' | 'uploading' | 'error' | 'success'
    autoSyncSuccessCount?: number
    autoSyncTotalCount?: number
  },
  string
>({
  key: 'ConversationSyncStateFamily',
  default: {
    autoSyncStatus: 'idle',
  },
})

const useSyncConversation = () => {
  const { t } = useTranslation(['client'])
  const { clientConversation } = useClientConversation()
  const [conversationSyncState, setConversationSyncState] = useRecoilState(
    ConversationSyncStateFamily(clientConversation?.id || ''),
  )
  const autoSyncConversation = useCallback(async () => {
    if (
      !clientConversation?.id ||
      clientConversation.messages.length === 0 ||
      conversationSyncState.autoSyncStatus === 'uploading' ||
      conversationSyncState.autoSyncStatus === 'success'
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
    debugger
    // 上传会话和消息
    try {
      setConversationSyncState((prev) => {
        return {
          ...prev,
          autoSyncStatus: 'uploading',
          autoSyncSuccessCount: 0,
          autoSyncTotalCount: clientConversation.messages.length,
        }
      })
      const needUploadConversation: any = cloneDeep(clientConversation)
      const needUploadMessages = cloneDeep(needUploadConversation.messages)
      // 消息是分开存的, 需要删除
      delete needUploadConversation.messages
      // 需要上传
      const result = await clientFetchMaxAIAPI<{
        status: string
      }>('/conversation/upsert_conversation', needUploadConversation)
      if (result.data?.status !== 'OK') {
        errorTips()
        return
      }
      // 上传消息
      const conversationId = needUploadConversation.id
      // 每次上传30条消息
      const perUploadCount = 30
      const messageChunks = []
      let successCount = 0
      let hasError = false
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
          errorTips()
          setConversationSyncState((prev) => {
            return {
              ...prev,
              autoSyncStatus: 'error',
            }
          })
          hasError = true
          break
        } else {
          successCount += messageChunk.length
        }
      }
      setConversationSyncState((prev) => {
        return {
          ...prev,
          autoSyncStatus: hasError ? 'error' : 'success',
          autoSyncSuccessCount: successCount,
        }
      })
    } catch (e) {
      errorTips()
      setConversationSyncState((prev) => {
        return {
          ...prev,
          autoSyncSuccessCount: 0,
          autoSyncStatus: 'error',
        }
      })
    }
  }, [setConversationSyncState, conversationSyncState, clientConversation, t])
  return {
    conversationSyncState,
    autoSyncConversation,
  }
}

/**
 * 自动同步对话
 * - 当focus
 * - conversationId改变
 * @constructor
 */
const AutoSyncConversation: FC<{
  sx?: SxProps
}> = (props) => {
  const { sx } = props
  const { autoSyncConversation, conversationSyncState } = useSyncConversation()
  const { clientConversation } = useClientConversation()

  /**
   * 当前对话ID改变时，自动同步对话
   * - 当前对话ID改变时，自动同步对话
   * - 当focus时，自动同步对话
   */
  useEffect(() => {
    console.log('AutoSyncConversation', clientConversation?.id)
    const executeAutoSyncConversation = async () => {
      await autoSyncConversation()
    }
    window.addEventListener('focus', executeAutoSyncConversation)
    return () => {
      window.removeEventListener('focus', executeAutoSyncConversation)
    }
  }, [autoSyncConversation])
  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      gap={1}
      sx={{
        ...sx,
      }}
    >
      {conversationSyncState.autoSyncStatus === 'uploading' && (
        <>
          <div>{conversationSyncState.autoSyncStatus}</div>
          <div>{`(${conversationSyncState.autoSyncSuccessCount}/${conversationSyncState.autoSyncTotalCount})`}</div>
          <SyncOutlinedIcon
            sx={{
              color: 'text.primary',
              // 一直旋转
              animation: 'spin 2s linear infinite',
              '@keyframes spin': {
                from: {
                  transform: 'rotate(0deg)',
                },
                to: {
                  transform: 'rotate(360deg)',
                },
              },
            }}
          />
        </>
      )}
    </Stack>
  )
}
export default AutoSyncConversation
