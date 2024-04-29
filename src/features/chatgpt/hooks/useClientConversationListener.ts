// hooks/useClientChatGPTFiles.ts
import { HTMLParagraphElement } from 'linkedom'
import cloneDeep from 'lodash-es/cloneDeep'
import isArray from 'lodash-es/isArray'
import isNumber from 'lodash-es/isNumber'
import { useCallback, useEffect, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { useCreateClientMessageListener } from '@/background/utils'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  ClientConversationMapState,
  ClientUploadedFilesState,
} from '@/features/chatgpt/store'
import { IChatUploadFile, ISystemChatMessage } from '@/features/chatgpt/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { AppDBStorageState } from '@/store'
import { getMaxAISidebarRootElement } from '@/utils'
import { listReverseFind } from '@/utils/dataHelper/arrayHelper'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

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

    const updateFiles = async () => {
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

    updateFiles()
    window.addEventListener('focus', updateFiles)

    return () => {
      window.removeEventListener('focus', updateFiles)
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
      case 'Client_listenUpdateConversationMessages': {
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
              clientChatConversationModifyChatMessages(
                'add',
                currentConversationIdRef.current,
                0,
                [
                  {
                    messageId: errorItem.id,
                    text:
                      errorItem.uploadErrorMessage ||
                      `File ${errorItem.fileName} upload error.`,
                    type: 'system',
                    meta: {
                      status:
                        errorItem.uploadErrorMessage ===
                        `Your previous upload didn't go through as the Code Interpreter was initializing. It's now ready for your file. Please try uploading it again.`
                          ? 'info'
                          : 'error',
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
            clientChatConversationModifyChatMessages(
              'add',
              currentConversationIdRef.current,
              0,
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
        clientGetConversation(currentConversationId).then(
          async (conversation) => {
            if (conversation) {
              console.log(
                `新版Conversation [${currentConversationId}]effect更新`,
                conversation.messages,
              )
              setClientConversationMap((prevState) => {
                return {
                  ...prevState,
                  [conversation.id]: conversation,
                }
              })
            }
          },
        )
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
      clientConversation.messages.length === 0 ||
      isCreatingConversationRef.current
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
      if (isMaxAIImmersiveChatPage()) {
        resetConversation()
      }
    }
  }, [clientConversation, resetConversation])
}

export default useClientConversationListener
