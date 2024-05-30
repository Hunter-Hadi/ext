// hooks/useClientChatGPTFiles.ts
import { HTMLParagraphElement } from 'linkedom'
import cloneDeep from 'lodash-es/cloneDeep'
import isArray from 'lodash-es/isArray'
import isNumber from 'lodash-es/isNumber'
import orderBy from 'lodash-es/orderBy'
import { useCallback, useEffect, useRef } from 'react'
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { useCreateClientMessageListener } from '@/background/utils'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  ClientConversationMapState,
  ClientUploadedFilesState,
  PaginationConversationMessagesStateFamily,
} from '@/features/chatgpt/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { useFocus } from '@/features/common/hooks/useFocus'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import {
  IChatUploadFile,
  ISystemChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import { AppDBStorageState } from '@/store'
import { getMaxAISidebarRootElement } from '@/utils'
import { listReverseFind } from '@/utils/dataHelper/arrayHelper'
import {
  isMaxAIImmersiveChatPage,
  isMaxAISettingsPage,
} from '@/utils/dataHelper/websiteHelper'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

/**
 * 初始化客户端聊天
 * - 监听客户端聊天事件
 * - 监听客户端聊天文件上传事件
 * - 监听客户端聊天状态更新事件
 * - 自动归档 - v4.2.0 - 2024-04
 */
export const useClientConversationListener = () => {
  const [, setClientConversationMap] = useRecoilState(
    ClientConversationMapState,
  )
  const appDBStorage = useRecoilValue(AppDBStorageState)
  const { files, aiProviderRemoveFiles } = useAIProviderUpload()
  const { currentAIProvider } = useAIProviderModels()
  const {
    createConversation,
    resetConversation,
    updateConversationStatus,
    currentConversationId,
    clientConversationMessages,
    currentConversationIdRef,
    clientConversation,
  } = useClientConversation()

  const updateConversationStatusRef = useRef(updateConversationStatus)
  useEffect(() => {
    updateConversationStatusRef.current = updateConversationStatus
  }, [updateConversationStatus])
  const [clientUploadedState, setClientUploadedState] = useRecoilState(
    ClientUploadedFilesState(currentConversationId || ''),
  )

  const { blurDelay } = clientUploadedState
  const blurDelayRef = useRef(false)

  const setFiles = useCallback(
    (files: IChatUploadFile[]) => {
      setClientUploadedState((prevState) => ({
        ...prevState,
        files,
      }))
    },
    [setClientUploadedState],
  )
  const setFilesRef = useRef(setFiles)
  useEffect(() => {
    setFilesRef.current = setFiles
  }, [setFiles])

  useEffect(() => {
    blurDelayRef.current = blurDelay
  }, [blurDelay])

  useEffect(() => {
    if (!currentConversationId) {
      return
    }

    const updateConversation = async () => {
      ClientConversationManager.getConversationById(currentConversationId).then(
        async (conversation) => {
          if (conversation) {
            const isDelete = conversation.isDelete
            console.log(
              `ConversationDB[V3] [${currentConversationId}]effect更新`,
              conversation,
            )
            if (isDelete) {
              setClientConversationMap((prevState) => {
                const newState = cloneDeep(prevState)
                delete newState[conversation.id]
                return newState
              })
            } else {
              setClientConversationMap((prevState) => {
                return {
                  ...prevState,
                  [conversation.id]: conversation,
                }
              })
            }
          }
        },
      )
      const result = await port.postMessage({
        event: 'Client_chatGetFiles',
        data: {
          conversationId: currentConversationId,
        },
      })
      if (isArray(result.data)) {
        setFilesRef.current(result.data)
      }
    }

    updateConversation()
    window.addEventListener('focus', updateConversation)

    return () => {
      window.removeEventListener('focus', updateConversation)
    }
  }, [currentConversationId])

  useCreateClientMessageListener(async (event, data) => {
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_listenUploadFilesChange': {
        const { files, conversationId } = data
        console.log(
          'useClientChatGPTFiles [Client_listenUploadFilesChange]',
          files,
          conversationId,
        )
        if (conversationId !== currentConversationIdRef.current) {
          return undefined
        }
        setFilesRef.current(files)
        return {
          success: true,
          data: {},
          message: '',
        }
      }
      case 'Client_ChatGPTStatusUpdate': {
        const { status, conversationId } = data
        if (conversationId !== currentConversationIdRef.current) {
          return undefined
        }
        console.log(`Client_ChatGPTStatusUpdate ${status} [${conversationId}]`)
        updateConversationStatusRef.current(status)
        return {
          success: true,
          message: '',
          data: {},
        }
      }
      case 'Client_listenUpdateConversation': {
        const { conversation, conversationId } = data
        if (conversation?.id) {
          setClientConversationMap((prevState) => {
            return {
              ...prevState,
              [conversation.id]: conversation,
            }
          })
        } else if (!conversation) {
          // 如果是删除的话，就不会有conversation
          setClientConversationMap((prevState) => {
            const newState = cloneDeep(prevState)
            delete newState[conversationId]
            return newState
          })
        }
        return {
          success: true,
        }
      }
      default:
        break
    }
    return undefined
  })
  const isPushingMessageRef = useRef(false)
  useEffect(() => {
    const errorItem = files.find((item) => item.uploadStatus === 'error')
    if (errorItem) {
      isPushingMessageRef.current = true
      switch (currentAIProvider) {
        case 'OPENAI':
          {
            if (
              currentConversationIdRef.current &&
              !listReverseFind(
                clientConversationMessages,
                (item) => item.messageId === errorItem.id,
              )
            ) {
              ClientConversationMessageManager.addMessages(
                currentConversationIdRef.current,
                [
                  {
                    messageId: errorItem.id,
                    text:
                      errorItem.uploadErrorMessage ||
                      `File ${errorItem.fileName} upload error.`,
                    type: 'system',
                    meta: {
                      status: 'error',
                    },
                  } as ISystemChatMessage,
                ],
              )
                .then()
                .catch()
                .finally(() => {
                  isPushingMessageRef.current = false
                })
            }
          }
          break
        default: {
          if (
            currentConversationIdRef.current &&
            !listReverseFind(
              clientConversationMessages,
              (item) => item.messageId === errorItem.id,
            )
          ) {
            ClientConversationMessageManager.addMessages(
              currentConversationIdRef.current,
              [
                {
                  messageId: errorItem.id,
                  text:
                    errorItem.uploadErrorMessage ||
                    `File ${errorItem.fileName} upload error.`,
                  type: 'system',
                  meta: {
                    status: 'error',
                  },
                } as ISystemChatMessage,
              ],
            )
              .then()
              .catch()
              .finally(() => {
                isPushingMessageRef.current = false
              })
          }
        }
      }
      aiProviderRemoveFiles([errorItem])
    }
  }, [
    files,
    currentAIProvider,
    clientConversationMessages,
    currentConversationIdRef,
  ])
  /**
   * 在focus的时候
   * - 检查是否有上传失败的文件
   * - 更新最新的status
   */
  useEffect(() => {
    if (currentConversationId) {
      const port = new ContentScriptConnectionV2({
        runtime: 'client',
      })
      /**
       * 检查Chat状态
       */
      const checkChatGPTStatus = async () => {
        ClientConversationManager.getConversationById(
          currentConversationId,
        ).then(async (conversation) => {
          if (conversation) {
            console.log(
              `ConversationDB[V3] [${currentConversationId}]effect更新`,
              conversation,
            )
            setClientConversationMap((prevState) => {
              return {
                ...prevState,
                [conversation.id]: conversation,
              }
            })
          }
        })
        const result = await port.postMessage({
          event: 'Client_checkChatGPTStatus',
          data: {
            conversationId: currentConversationId,
          },
        })
        console.log(
          `新版Conversation [${currentConversationId}]status更新`,
          result.data,
          currentConversationIdRef.current,
          currentConversationId,
        )
        if (result.success && result.data.status) {
          updateConversationStatus(result.data.status)
        }
      }
      window.addEventListener('focus', checkChatGPTStatus)
      checkChatGPTStatus()
      // 获取当前的conversation的数据
      return () => {
        port.destroy()
        window.removeEventListener('focus', checkChatGPTStatus)
      }
    }
    return () => {}
  }, [currentConversationId])
  // 自动归档
  const isCreatingConversationRef = useRef(false)
  useEffect(() => {
    if (
      !clientConversation ||
      clientConversationMessages.length === 0 ||
      isCreatingConversationRef.current ||
      isMaxAIImmersiveChatPage() ||
      isMaxAISettingsPage()
    ) {
      return
    }
    const autoArchiveTime =
      appDBStorage.userSettings?.sidebar?.autoArchive?.[clientConversation.type]
    if (autoArchiveTime && isNumber(autoArchiveTime)) {
      const archiveTime =
        new Date(clientConversation.updated_at).getTime() + autoArchiveTime
      const now = Date.now()
      if (now > archiveTime) {
        // 判断当前会话的消息数量
        console.log(
          `自动归档时间[触发][${clientConversation.type}], 超过[${(
            (now - archiveTime) /
            1000 /
            60
          ).toFixed(2)}]分钟`,
        )
        const text = getMaxAISidebarRootElement()?.querySelector?.(
          '#auto-archive',
        ) as any as HTMLParagraphElement
        if (text) {
          text.textContent = `自动归档时间[触发][${
            clientConversation.type
          }], 超过[${((now - archiveTime) / 1000 / 60).toFixed(2)}]分钟`
        }
        if (!isCreatingConversationRef.current) {
          isCreatingConversationRef.current = true
        }
        createConversation(
          clientConversation.type,
          clientConversation.meta.AIProvider,
          clientConversation.meta.AIModel,
        )
          .then()
          .catch()
          .finally(() => {
            isCreatingConversationRef.current = false
          })
      } else {
        const text = getMaxAISidebarRootElement()?.querySelector?.(
          '#auto-archive',
        ) as any as HTMLParagraphElement
        if (text) {
          text.textContent = `自动归档时间[未触发][${
            clientConversation.type
          }], 还剩[${((archiveTime - now) / 1000 / 60).toFixed(2)}]分钟`
        }
        console.log(
          `自动归档时间[未触发][${clientConversation.type}], 还剩[${(
            (archiveTime - now) /
            1000 /
            60
          ).toFixed(2)}]分钟`,
        )
      }
    }
  }, [clientConversation, appDBStorage.userSettings?.sidebar?.autoArchive])

  useEffect(() => {
    if (clientConversation && clientConversation.isDelete) {
      resetConversation()
    }
  }, [clientConversation, resetConversation])
  const updateConversationMessages = useRecoilCallback(
    ({ set, snapshot }) =>
      async (
        changeType: 'add' | 'update' | 'delete' | 'focus',
        conversationId: string,
        messageIds: string[],
      ) => {
        const conversationState = await snapshot.getPromise(
          ClientConversationMapState,
        )
        if (conversationState[conversationId]) {
          // 说明当前的conversation是存在的
          switch (changeType) {
            case 'add':
            case 'update':
            case 'focus':
              {
                const messages =
                  await ClientConversationMessageManager.getMessagesByMessageIds(
                    messageIds,
                  )
                set(
                  PaginationConversationMessagesStateFamily(conversationId),
                  (prevState) => {
                    return orderBy(
                      prevState
                        .filter((item) => !messageIds.includes(item.messageId))
                        .concat(messages),
                      'created_at',
                      'asc',
                    )
                  },
                )
              }
              break
            case 'delete':
              {
                set(
                  PaginationConversationMessagesStateFamily(conversationId),
                  (prevState) => {
                    return prevState.filter(
                      (item) => !messageIds.includes(item.messageId),
                    )
                  },
                )
              }
              break
          }
          return true
        }
        return undefined
      },
    [],
  )
  useFocus(() => {
    if (currentConversationIdRef.current) {
      // TODO: 强行更新全部的消息, 以后可以优化
      ClientConversationMessageManager.getMessageIds(
        currentConversationIdRef.current!,
      ).then(async (messageIds) => {
        await updateConversationMessages(
          'focus',
          currentConversationIdRef.current!,
          messageIds,
        )
      })
    }
  })
  // 更新对话消息
  useEffect(() => {
    const unsubscribe = OneShotCommunicator.receive(
      'ConversationMessagesUpdate',
      async (data) => {
        const { changeType, conversationId, messageIds } = data
        if (currentConversationIdRef.current !== conversationId) {
          return undefined
        }
        return await updateConversationMessages(
          changeType,
          conversationId,
          messageIds,
        )
      },
    )
    return () => unsubscribe()
  }, [updateConversationMessages])
}

export default useClientConversationListener
