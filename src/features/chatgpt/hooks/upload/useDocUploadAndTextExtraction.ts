import { useEffect, useRef } from 'react'

import { MAXAI_IN_HOUSE_AI_PROVIDERS } from '@/features/chatgpt/constant'
import useAIProviderUpload, {
  MaxAIAddOrUpdateUploadFile,
} from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import FileExtractor from '@/features/sidebar/utils/FileExtractor'
import { filesizeFormatter } from '@/utils/dataHelper/numberHelper'
import globalSnackbar from '@/utils/globalSnackbar'

const useDocUploadAndTextExtraction = () => {
  const {
    files,
    aiProviderRemoveFiles,
    AIProviderConfig,
    addOrUpdateUploadFile,
  } = useAIProviderUpload()
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
    // 判断文件大小
    const maxFileSize = AIProviderConfig?.maxFileSize || 10 * 1024 * 1024 //10mb
    const errorFileNames: string[] = []
    const canUploadFiles = docFiles.filter((file) => {
      if (file && file.size < maxFileSize) {
        return true
      }
      errorFileNames.push(file.name)
      return false
    })
    if (errorFileNames.length > 0) {
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
    if (
      currentAIProvider &&
      MAXAI_IN_HOUSE_AI_PROVIDERS.includes(currentAIProvider) &&
      currentAIProviderModel
    ) {
      const existFilesCount = files?.length || 0
      const maxFiles = AIProviderConfig?.maxCount || 1
      const canUploadCount = maxFiles - existFilesCount
      if (canUploadCount === 0) {
        await aiProviderRemoveFiles(files.slice(0, canUploadFiles.length))
      }
      await Promise.all(
        canUploadFiles.slice(0, canUploadCount).map(async (docFile) => {
          const extractedResult = await FileExtractor.extractFile(
            docFile,
            addOrUpdateUploadFileRef.current,
          )
          if (extractedResult.success) {
            return extractedResult.chatUploadFile
          } else if (extractedResult.error) {
            globalSnackbar.error(extractedResult.error, {
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
              },
            })
            return null
          }
          return null
        }),
      )
    }
  }
  return {
    uploadDocAndTextExtraction,
  }
}
export default useDocUploadAndTextExtraction
