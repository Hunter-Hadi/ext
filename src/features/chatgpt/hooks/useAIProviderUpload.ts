import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IChatUploadFile, ISystemChatMessage } from '@/features/chatgpt/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { useFocus } from '@/hooks/useFocus'
import isArray from 'lodash-es/isArray'
import { useCreateClientMessageListener } from '@/background/utils'
import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import cloneDeep from 'lodash-es/cloneDeep'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import {
  checkFileTypeIsImage,
  serializeUploadFile,
} from '@/background/utils/uplpadFileProcessHelper'
import useEffectOnce from '@/hooks/useEffectOnce'
import { bingCompressedImageDataAsync } from '@/background/src/chat/BingChat/bing/utils'
import { listReverseFind } from '@/utils/dataHelper/arrayHelper'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

/**
 * AI Provider的上传文件处理
 */
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const useAIProviderUpload = () => {
  const [files, setFiles] = useState<IChatUploadFile[]>([])
  const { currentAIProviderModelDetail, aiProvider } = useAIProviderModels()
  const {
    currentSidebarConversationMessages,
    currentSidebarConversationId,
  } = useSidebarSettings()
  const blurDelayRef = useRef(false)
  const AIProviderConfig = useMemo(() => {
    return currentAIProviderModelDetail?.uploadFileConfig
  }, [currentAIProviderModelDetail])
  // 上传文件
  const aiProviderUploadFiles = useCallback(
    async (newUploadFiles: IChatUploadFile[]) => {
      // 获取上传令牌
      // const { data: aiProviderUploadFileToken } = await port.postMessage({
      //   event: 'Client_chatGetUploadFileToken',
      //   data: {},
      // })
      blurDelayRef.current = true
      const uploadingFiles = cloneDeep(newUploadFiles).map((item) => {
        if (item.uploadStatus === 'idle') {
          item.uploadStatus = 'uploading'
          item.uploadProgress = 20
        }
        return item
      })
      console.log('useAIProviderUpload [aiProviderUploadFiles]', uploadingFiles)
      setFiles(uploadingFiles)
      switch (aiProvider) {
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
        blurDelayRef.current = false
      }, 1000)
    },
    [AIProviderConfig, aiProvider],
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
    switch (aiProvider) {
      case 'OPENAI':
        return 'File uploading. Please send your message once upload completes.'
      default:
        return 'File uploading. Please send your message once upload completes.'
    }
    return ''
  }, [aiProvider])
  useEffect(() => {
    const errorItem = files.find((item) => item.uploadStatus === 'error')
    if (errorItem) {
      switch (aiProvider) {
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
                    extra: {
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
                  extra: {
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
  }, [files, aiProvider])
  useFocus(() => {
    port
      .postMessage({
        event: 'Client_chatGetFiles',
        data: {},
      })
      .then((result) => {
        if (blurDelayRef.current) {
          return
        }
        if (isArray(result.data)) {
          console.log('useAIProviderUpload [Client_chatGetFiles]', result.data)
          setFiles(result.data)
        }
      })
  })
  useEffectOnce(() => {
    port
      .postMessage({
        event: 'Client_chatGetFiles',
        data: {},
      })
      .then((result) => {
        if (isArray(result.data)) {
          console.log('useAIProviderUpload [Client_chatGetFiles]', result.data)
          setFiles(result.data)
        }
      })
  })
  useCreateClientMessageListener(async (event, data, sender) => {
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_listenUploadFilesChange': {
        const { files } = data
        console.log(
          'useAIProviderUpload [Client_listenUploadFilesChange]',
          files,
        )
        setFiles(files)
        return {
          success: true,
          data: {},
          message: '',
        }
      }
      default:
        break
    }
    return undefined
  })
  return {
    aiProviderUploadingTooltip,
    AIProviderConfig,
    aiProviderUploadFiles,
    aiProviderRemoveFiles,
    files,
  }
}
export default useAIProviderUpload
