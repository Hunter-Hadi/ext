import cloneDeep from 'lodash-es/cloneDeep'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useRecoilState } from 'recoil'

import { bingCompressedImageDataAsync } from '@/background/src/chat/BingChat/bing/utils'
import {
  checkFileTypeIsImage,
  serializeUploadFile,
} from '@/background/utils/uplpadFileProcessHelper'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { ClientUploadedFilesState } from '@/features/chatgpt/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { maxAIFileUpload } from '@/features/shortcuts/utils/MaxAIFileUpload'
import { filesizeFormatter } from '@/utils/dataHelper/numberHelper'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import globalSnackbar from '@/utils/globalSnackbar'

import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message';

/**
 * AI Provider的上传文件处理
 */
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

export type MaxAIAddOrUpdateUploadFile = (
  fileId: string,
  updateFileData: Partial<IChatUploadFile>,
) => Promise<void>
export const DEFAULT_UPLOAD_MAX_SIZE = 5 * 1024 * 1024 // 5MB

const useAIProviderUpload = () => {
  const { currentConversationId } = useClientConversation()
  const [clientUploadedState, setClientUploadedState] = useRecoilState(
    ClientUploadedFilesState(currentConversationId || ''),
  )
  const { files } = clientUploadedState

  const { currentAIProviderModelDetail, currentAIProvider } =
    useAIProviderModels()
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

  /**
   * 过滤超出大小限制的文件
   * @param needUploadFiles 需要上传的文件
   * @param options 配置项
   * @param options.showErrorAlert 是否显示错误提示
   * @returns 可以上传的文件
   */
  const getCanUploadFiles = async (
    needUploadFiles: File[],
    options?: {
      showErrorAlert?: boolean
    },
  ) => {
    const { showErrorAlert = true } = options || {}
    const { maxCount = 1, maxFileSize = DEFAULT_UPLOAD_MAX_SIZE } =
      AIProviderConfig || {}
    const existFilesCount = files?.length || 0
    const errorFileNames: string[] = []
    // 过滤超出大小限制的文件, 只取前maxCount个
    const canUploadFiles: File[] = needUploadFiles
      .filter((file) => {
        if (file.size < maxFileSize || maxFileSize === -1) {
          return true
        }
        errorFileNames.push(file.name)
        return false
      })
      .slice(0, maxCount)
    // 如果有超出大小限制的文件，并且showErrorAlert为true，则弹出提示
    if (errorFileNames.length > 0 && showErrorAlert) {
      globalSnackbar.error(
        `Upload failed: ${errorFileNames.join(
          ',',
        )} exceeds the ${filesizeFormatter(
          maxFileSize,
          2,
        )} limit. Please select a smaller file.`,
        {
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        },
      )
    }

    // 只取可以上传的文件
    const needUploadFilesCount = canUploadFiles.length
    // 先计算可以上传的文件数量
    const canUploadCount = maxCount - existFilesCount
    // 如果需要上传的文件数量大于可以上传的文件数量，则删除已存在的文件
    if (needUploadFilesCount > canUploadCount) {
      // 删除已存在的文件, 从第一个开始删除
      const needDeleteCount = needUploadFilesCount - canUploadCount
      await aiProviderRemoveFiles(files.slice(0, needDeleteCount))
    }
    return canUploadFiles
  }

  const updateBlurDelayRef = (flag: boolean) => {
    setClientUploadedState((preSate) => {
      return {
        ...preSate,
        blurDelay: flag,
      }
    })
  }
  const filesRef = useRef(files)
  useEffect(() => {
    filesRef.current = files
  }, [files])
  const addOrUpdateUploadFile = useCallback<MaxAIAddOrUpdateUploadFile>(
    async (fileId: string, updateFileData: Partial<IChatUploadFile>) => {
      let isFindUpdateFile = false
      const newFiles = filesRef.current.map((item) => {
        if (item.id === fileId) {
          isFindUpdateFile = true
          console.log(
            'useAIProviderUpload [addOrUpdateUploadFile] updated',
            updateFileData,
          )
          return mergeWithObject([item, updateFileData])
        }
        return item
      })
      if (!isFindUpdateFile && updateFileData.id) {
        console.log(
          'useAIProviderUpload [addOrUpdateUploadFile] added',
          updateFileData,
        )
        newFiles.push(updateFileData as IChatUploadFile)
        await port.postMessage({
          event: 'Client_chatUploadFiles',
          data: {
            conversationId: currentConversationId,
            files: [updateFileData as IChatUploadFile],
          },
        })
        return
      }
      setClientUploadedState((prevState) => {
        return {
          ...prevState,
          files: newFiles,
        }
      })
      await port.postMessage({
        event: 'Client_chatUploadFilesChange',
        data: {
          conversationId: currentConversationId,
          files: newFiles,
        },
      })
    },
    [currentConversationId],
  )

  // 上传文件
  const aiProviderUploadFiles = useCallback(
    async (newUploadFiles: IChatUploadFile[]) => {
      // 获取上传令牌
      // const { data: aiProviderUploadFileToken } = await port.postMessage({
      //   event: 'Client_chatGetUploadFileToken',
      //   data: {
      //     conversationId: currentConversationId
      //   },
      // })
      updateBlurDelayRef(true)
      const uploadingFiles = cloneDeep(newUploadFiles).map((item) => {
        if (item.uploadStatus === 'idle') {
          item.uploadStatus = 'uploading'
          item.uploadProgress = 20
        }
        return item
      })
      await port.postMessage({
        event: 'Client_chatUploadFiles',
        data: {
          files: uploadingFiles,
          conversationId: currentConversationId,
        },
      })
      setFiles(uploadingFiles, 'add')
      switch (currentAIProvider) {
        case 'OPENAI':
          {
            // 确保/pages/chatgpt/codeInterpreter.ts正确的注入了
          }
          break
        case 'BING':
          {
            const newFiles = await Promise.all(
              newUploadFiles.map(async (item) => {
                if (item.file && checkFileTypeIsImage(item.file)) {
                  const bingCompressBase64Data =
                    await bingCompressedImageDataAsync(item.file)
                  if (bingCompressBase64Data) {
                    item.base64Data = bingCompressBase64Data
                  }
                }
                return item
              }),
            )
            await port.postMessage({
              event: 'Client_chatUploadFilesChange',
              data: {
                conversationId: currentConversationId,
                files: newFiles,
              },
            })
          }
          break
        case 'USE_CHAT_GPT_PLUS':
        case 'MAXAI_CLAUDE':
        case 'MAXAI_GEMINI':
        case 'MAXAI_FREE':
          {
            // 更新客户端显示上传中状态
            const newFiles = await Promise.all(
              newUploadFiles.map(async (chatUploadFile) => {
                if (chatUploadFile.uploadStatus === 'success') {
                  return chatUploadFile
                }
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
              event: 'Client_chatUploadFilesChange',
              data: {
                conversationId: currentConversationId,
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
              event: 'Client_chatUploadFilesChange',
              data: {
                conversationId: currentConversationId,
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
    [AIProviderConfig, currentAIProvider, currentConversationId],
  )
  const aiProviderRemoveFiles = useCallback(
    async (files: IChatUploadFile[]) => {
      const result = await port.postMessage({
        event: 'Client_chatRemoveFiles',
        data: {
          conversationId: currentConversationId,
          files,
        },
      })
      console.log('useAIProviderUpload [Client_chatRemoveFiles]', result.data)
      setFiles(Array.isArray(result.data) ? result.data : [])
      return result.success
    },
    [AIProviderConfig],
  )
  const aiProviderRemoveAllFiles = useCallback(async () => {
    const result = await port.postMessage({
      event: 'Client_chatClearFiles',
      data: {
        conversationId: currentConversationId,
      },
    })
    setFiles(Array.isArray(result.data) ? result.data : [])
    return result.success
  }, [AIProviderConfig])
  const aiProviderUploadingTooltip = useMemo(() => {
    switch (currentAIProvider) {
      case 'OPENAI':
        return 'File uploading. Please send your message once upload completes.'
      default:
        return 'File uploading. Please send your message once upload completes.'
    }
  }, [currentAIProvider])

  return {
    aiProviderUploadingTooltip,
    AIProviderConfig,
    aiProviderUploadFiles,
    aiProviderRemoveFiles,
    aiProviderRemoveAllFiles,
    addOrUpdateUploadFile,
    getCanUploadFiles,
    files,
  }
}
export default useAIProviderUpload
