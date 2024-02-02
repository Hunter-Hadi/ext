import cloneDeep from 'lodash-es/cloneDeep'
import { useCallback, useEffect, useMemo } from 'react'
import { useRecoilState } from 'recoil'

import { bingCompressedImageDataAsync } from '@/background/src/chat/BingChat/bing/utils'
import {
  checkFileTypeIsImage,
  serializeUploadFile,
} from '@/background/utils/uplpadFileProcessHelper'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { ClientUploadedFilesState } from '@/features/chatgpt/store'
import { IChatUploadFile, ISystemChatMessage } from '@/features/chatgpt/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { maxAIFileUpload } from '@/features/shortcuts/utils/MaxAIFileUpload'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { listReverseFind } from '@/utils/dataHelper/arrayHelper'

/**
 * AI Provider的上传文件处理
 */
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const useAIProviderUpload = () => {
  const [clientUploadedState, setClientUploadedState] = useRecoilState(
    ClientUploadedFilesState,
  )
  const { files } = clientUploadedState

  const {
    currentAIProviderModelDetail,
    currentAIProvider,
  } = useAIProviderModels()
  const {
    currentSidebarConversationMessages,
    currentSidebarConversationId,
  } = useSidebarSettings()
  const AIProviderConfig = useMemo(() => {
    return currentAIProviderModelDetail?.uploadFileConfig
  }, [currentAIProviderModelDetail])

  const setFiles = (
    files: IChatUploadFile[],
    operate: 'add' | 'cover' = 'cover',
  ) => {
    setClientUploadedState((preSate) => {
      return {
        ...preSate,
        files: operate === 'add' ? preSate.files.concat(files) : files,
      }
    })
  }

  const updateBlurDelayRef = (flag: boolean) => {
    setClientUploadedState((preSate) => {
      return {
        ...preSate,
        blurDelay: flag,
      }
    })
  }

  // 上传文件
  const aiProviderUploadFiles = useCallback(
    async (newUploadFiles: IChatUploadFile[]) => {
      // 获取上传令牌
      // const { data: aiProviderUploadFileToken } = await port.postMessage({
      //   event: 'Client_chatGetUploadFileToken',
      //   data: {},
      // })
      updateBlurDelayRef(true)
      const uploadingFiles = cloneDeep(newUploadFiles).map((item) => {
        if (item.uploadStatus === 'idle') {
          item.uploadStatus = 'uploading'
          item.uploadProgress = 20
        }
        return item
      })
      console.log('useAIProviderUpload [aiProviderUploadFiles]', uploadingFiles)
      setFiles(uploadingFiles, 'add')
      switch (currentAIProvider) {
        case 'OPENAI':
          {
            // 确保/pages/chatgpt/codeInterpreter.ts正确的注入了
            await port.postMessage({
              event: 'Client_chatUploadFiles',
              data: {
                files: uploadingFiles,
              },
            })
          }
          break
        case 'BING':
          {
            const newFiles = await Promise.all(
              newUploadFiles.map(async (item) => {
                if (item.file && checkFileTypeIsImage(item.file)) {
                  const bingCompressBase64Data = await bingCompressedImageDataAsync(
                    item.file,
                  )
                  if (bingCompressBase64Data) {
                    item.base64Data = bingCompressBase64Data
                  }
                }
                return item
              }),
            )
            await port.postMessage({
              event: 'Client_chatUploadFiles',
              data: {
                files: newFiles,
              },
            })
          }
          break
        case 'USE_CHAT_GPT_PLUS':
          {
            const newFiles = await Promise.all(
              newUploadFiles.map(async (chatUploadFile) => {
                if (!chatUploadFile.file) {
                  return undefined
                }
                const result = await maxAIFileUpload(chatUploadFile.file, {
                  useCase: 'multimodal',
                })
                chatUploadFile.uploadedFileId = result.file_id
                chatUploadFile.uploadedUrl = result.file_url
                chatUploadFile.uploadStatus = result.success
                  ? 'success'
                  : 'error'
                chatUploadFile.blobUrl = ''
                chatUploadFile.uploadErrorMessage = result.error
                chatUploadFile.uploadProgress = result.success ? 100 : 0
                if (chatUploadFile.uploadedUrl) {
                  // 释放内存
                  chatUploadFile.base64Data = undefined
                }
                return chatUploadFile
              }),
            )
            await port.postMessage({
              event: 'Client_chatUploadFiles',
              data: {
                files: newFiles,
              },
            })
          }
          break
        default:
          {
            // file转换unit8Array
            const newFiles = await Promise.all(
              newUploadFiles.map(async (item) => {
                const data = await serializeUploadFile(item.file!)
                const cloneItem = cloneDeep(item)
                cloneItem.file = data as any
                return cloneItem
              }),
            )
            await port.postMessage({
              event: 'Client_chatUploadFiles',
              data: {
                files: newFiles,
              },
            })
          }
          break
      }
      setTimeout(() => {
        updateBlurDelayRef(false)
      }, 1000)
    },
    [AIProviderConfig, currentAIProvider],
  )
  const aiProviderRemoveFiles = useCallback(
    async (files: IChatUploadFile[]) => {
      const result = await port.postMessage({
        event: 'Client_chatRemoveFiles',
        data: {
          files,
        },
      })
      console.log('useAIProviderUpload [Client_chatRemoveFiles]', result.data)
      setFiles(result.data || [])
      return result.success
    },
    [AIProviderConfig],
  )
  const aiProviderUploadingTooltip = useMemo(() => {
    switch (currentAIProvider) {
      case 'OPENAI':
        return 'File uploading. Please send your message once upload completes.'
      default:
        return 'File uploading. Please send your message once upload completes.'
    }
    return ''
  }, [currentAIProvider])

  useEffect(() => {
    const errorItem = files.find((item) => item.uploadStatus === 'error')
    if (errorItem) {
      switch (currentAIProvider) {
        case 'OPENAI':
          {
            if (
              currentSidebarConversationId &&
              !listReverseFind(
                currentSidebarConversationMessages,
                (item) => item.messageId === errorItem.id,
              )
            ) {
              clientChatConversationModifyChatMessages(
                'add',
                currentSidebarConversationId,
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
            }
          }
          break
        default: {
          if (
            currentSidebarConversationId &&
            !listReverseFind(
              currentSidebarConversationMessages,
              (item) => item.messageId === errorItem.id,
            )
          ) {
            clientChatConversationModifyChatMessages(
              'add',
              currentSidebarConversationId,
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
          }
        }
      }
      aiProviderRemoveFiles([errorItem])
    }
  }, [files, currentAIProvider])

  return {
    aiProviderUploadingTooltip,
    AIProviderConfig,
    aiProviderUploadFiles,
    aiProviderRemoveFiles,
    files,
  }
}
export default useAIProviderUpload
