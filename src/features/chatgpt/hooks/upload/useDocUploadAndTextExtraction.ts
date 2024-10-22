import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidV4 } from 'uuid'

import { MAXAI_IN_HOUSE_AI_PROVIDERS } from '@/features/chatgpt/constant'
import useAIProviderUpload, {
  MaxAIAddOrUpdateUploadFile,
} from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'
import { uploadMaxAIDocument } from '@/features/shortcuts/utils/maxAIDocument'
import { getTextTokensWithRequestIdle } from '@/features/shortcuts/utils/tokenizer'
import FileExtractor from '@/features/sidebar/utils/FileExtractor'
import globalSnackbar from '@/utils/globalSnackbar'

const useDocUploadAndTextExtraction = () => {
  const { t } = useTranslation(['client'])
  const { addOrUpdateUploadFile, getCanUploadFiles } = useAIProviderUpload()
  const { clientConversation } = useClientConversation()
  const { currentAIProvider, currentAIProviderModel } = useAIProviderModels()
  // 由于 执行 updateAIProviderModel 会导致 aiProviderUploadFiles 更新，
  // 但是 aiProviderUploadFiles 会被缓存，所以这里使用 ref 来获取最新的 aiProviderUploadFiles
  const addOrUpdateUploadFileRef = useRef<MaxAIAddOrUpdateUploadFile>(
    addOrUpdateUploadFile,
  )
  useEffect(() => {
    addOrUpdateUploadFileRef.current = addOrUpdateUploadFile
  }, [addOrUpdateUploadFile])

  const uploadDocAndTextExtraction = async (docFiles: File[]) => {
    if (!docFiles || docFiles.length === 0) {
      return
    }
    if (
      currentAIProvider &&
      MAXAI_IN_HOUSE_AI_PROVIDERS.includes(currentAIProvider) &&
      currentAIProviderModel
    ) {
      const canUploadFiles = await getCanUploadFiles(docFiles)
      const uploadFileMap: Record<string, File> = {}
      // 先创建上传文件的记录
      await Promise.all(
        canUploadFiles.map(async (docFile) => {
          const fileId = uuidV4()
          uploadFileMap[fileId] = docFile
          await addOrUpdateUploadFileRef.current(fileId, {
            id: fileId,
            fileName: docFile.name,
            fileSize: docFile.size,
            fileType: docFile.type,
            uploadStatus: 'uploading',
            uploadProgress: 0,
            icon: 'file',
          })
        }),
      )
      // const extractTextPromises = async () => {
      //   // 为了节省性能，一个一个提取
      //   for (const fileId in uploadFileMap) {
      //     const docFile = uploadFileMap[fileId]
      //     const extractedResult = await FileExtractor.extractFile(
      //       docFile,
      //       addOrUpdateUploadFileRef.current,
      //       fileId,
      //     )
      //     if (extractedResult.success) {
      //       await addOrUpdateUploadFileRef.current(fileId, {
      //         ...extractedResult.chatUploadFile,
      //         uploadStatus: 'success',
      //         uploadProgress: 80,
      //       })
      //     } else if (extractedResult.error) {
      //       await addOrUpdateUploadFileRef.current(fileId, {
      //         uploadStatus: 'error',
      //         uploadProgress: 0,
      //         uploadErrorMessage: extractedResult.error,
      //       })
      //       globalSnackbar.error(extractedResult.error, {
      //         autoHideDuration: 3000,
      //         anchorOrigin: {
      //           vertical: 'top',
      //           horizontal: 'right',
      //         },
      //       })
      //     }
      //   }
      // }

      const uploadResultMap: Record<string, Partial<IChatUploadFile>> = {}
      const uploadTextPromises = async () => {
        const fileIds = Object.keys(uploadFileMap)
        await Promise.all(
          fileIds.map(async (fileId) => {
            const file = uploadFileMap[fileId]
            if (file) {
              // TODO 后续拆分到packages里的时候需要重新整理上传文件所有功能
              // 上传doc的时候需要同步提取出pure_text纯文本内容
              // pdf文件以page_content__pdf类型上传
              const extractedResult = await FileExtractor.extractFile(
                file,
                addOrUpdateUploadFileRef.current,
                fileId,
              )
              if (extractedResult.success) {
                await addOrUpdateUploadFileRef.current(fileId, {
                  ...extractedResult.chatUploadFile,
                  uploadStatus: 'success',
                  uploadProgress: 80,
                })
                // 如果内容超出当前模型上下文长度，直接报错
                const { isLimit } = await getTextTokensWithRequestIdle(
                  extractedResult.chatUploadFile.extractedContent || '',
                  {
                    tokenLimit: clientConversation?.meta.maxTokens || 4096,
                  },
                )
                if (isLimit) {
                  const error = t(
                    `client:provider__chatgpt__upload_file_error__total_too_large__text`,
                  )
                  await addOrUpdateUploadFileRef.current(fileId, {
                    uploadStatus: 'error',
                    uploadProgress: 0,
                    uploadErrorMessage: error,
                  })
                  globalSnackbar.error(error, {
                    autoHideDuration: 3000,
                    anchorOrigin: {
                      vertical: 'top',
                      horizontal: 'right',
                    },
                  })
                } else {
                  const uploadResult = await uploadMaxAIDocument({
                    file,
                    pure_text: extractedResult.chatUploadFile.extractedContent,
                    doc_type: 'chat_file',
                  })
                  if (uploadResult.success) {
                    uploadResultMap[fileId] = {
                      uploadStatus: 'success',
                      uploadProgress: 100,
                      uploadedFileId: uploadResult.doc_id,
                      uploadedUrl: uploadResult.doc_url,
                    }
                  } else {
                    uploadResultMap[fileId] = {
                      uploadStatus: 'error',
                      uploadProgress: 0,
                      uploadErrorMessage: uploadResult.error,
                    }
                    globalSnackbar.error(uploadResult.error, {
                      autoHideDuration: 3000,
                      anchorOrigin: {
                        vertical: 'top',
                        horizontal: 'right',
                      },
                    })
                  }
                }
              } else if (extractedResult.error) {
                await addOrUpdateUploadFileRef.current(fileId, {
                  uploadStatus: 'error',
                  uploadProgress: 0,
                  uploadErrorMessage: extractedResult.error,
                })
                globalSnackbar.error(extractedResult.error, {
                  autoHideDuration: 3000,
                  anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right',
                  },
                })
              }
            }
            return file
          }),
        )
      }
      // await Promise.all([extractTextPromises(), uploadTextPromises()])
      await uploadTextPromises()
      await Promise.all(
        Object.keys(uploadResultMap).map(async (fileId) => {
          await addOrUpdateUploadFileRef.current(
            fileId,
            uploadResultMap[fileId],
          )
        }),
      )
    }
  }
  return {
    uploadDocAndTextExtraction,
  }
}
export default useDocUploadAndTextExtraction
