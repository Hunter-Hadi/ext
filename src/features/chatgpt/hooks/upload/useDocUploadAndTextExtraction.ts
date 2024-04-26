import { useEffect, useRef } from 'react'
import { v4 as uuidV4 } from 'uuid'

import { MAXAI_IN_HOUSE_AI_PROVIDERS } from '@/features/chatgpt/constant'
import useAIProviderUpload, {
  MaxAIAddOrUpdateUploadFile,
} from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import FileExtractor from '@/features/sidebar/utils/FileExtractor'
import globalSnackbar from '@/utils/globalSnackbar'

const useDocUploadAndTextExtraction = () => {
  const { addOrUpdateUploadFile, getCanUploadFiles } = useAIProviderUpload()
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
      // 为了节省性能，一个一个提取
      for (const fileId in uploadFileMap) {
        const docFile = uploadFileMap[fileId]
        const extractedResult = await FileExtractor.extractFile(
          docFile,
          addOrUpdateUploadFileRef.current,
          fileId,
        )
        if (extractedResult.success) {
          debugger
          await addOrUpdateUploadFileRef.current(fileId, {
            ...extractedResult.chatUploadFile,
            uploadStatus: 'success',
            uploadProgress: 100,
          })
        } else if (extractedResult.error) {
          debugger
          await addOrUpdateUploadFileRef.current(fileId, {
            uploadStatus: 'error',
            uploadProgress: 0,
            uploadErrorMessage: extractedResult.error,
          })
          globalSnackbar.error(extractedResult.error, {
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right',
            },
          })
        }
      }
    }
  }
  return {
    uploadDocAndTextExtraction,
  }
}
export default useDocUploadAndTextExtraction
