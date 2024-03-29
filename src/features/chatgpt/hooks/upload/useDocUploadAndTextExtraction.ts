import { useEffect, useRef } from 'react'

import { MAXAI_IN_HOUSE_AI_PROVIDERS } from '@/features/chatgpt/constant'
import useAIProviderUpload from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { IChatUploadFile } from '@/features/chatgpt/types'
import FileExtractor from '@/features/sidebar/utils/FileExtractor'
import globalSnackbar from '@/utils/globalSnackbar'

const useDocUploadAndTextExtraction = () => {
  const {
    files,
    aiProviderRemoveFiles,
    AIProviderConfig,
    aiProviderUploadFiles,
  } = useAIProviderUpload()
  const { currentAIProvider, currentAIProviderModel } = useAIProviderModels()
  // 由于 执行 updateAIProviderModel 会导致 aiProviderUploadFiles 更新，
  // 但是 aiProviderUploadFiles 会被缓存，所以这里使用 ref 来获取最新的 aiProviderUploadFiles
  const aiProviderUploadFilesRef = useRef(aiProviderUploadFiles)
  useEffect(() => {
    aiProviderUploadFilesRef.current = aiProviderUploadFiles
  }, [aiProviderUploadFiles])

  const uploadDocAndTextExtraction = async (docFiles: File[]) => {
    if (!docFiles || docFiles.length === 0) {
      return
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
        await aiProviderRemoveFiles(files.slice(0, docFiles.length))
      }
      const uploadFiles: IChatUploadFile[] = (
        await Promise.all(
          docFiles.slice(0, canUploadCount).map(async (docFile) => {
            const extractedResult = await FileExtractor.extractFile(docFile)
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
      ).filter((file): file is IChatUploadFile => file !== null)
      await aiProviderUploadFilesRef.current(uploadFiles)
    }
  }
  return {
    uploadDocAndTextExtraction,
  }
}
export default useDocUploadAndTextExtraction
