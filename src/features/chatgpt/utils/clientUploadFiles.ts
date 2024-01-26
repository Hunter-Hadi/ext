import { v4 as uuidV4 } from 'uuid'

import {
  checkFileTypeIsImage,
  file2base64,
} from '@/background/utils/uplpadFileProcessHelper'
import { IChatUploadFile } from '@/features/chatgpt/types'

export const DEFAULT_UPLOAD_MAX_SIZE = 5 * 1024 * 1024 // 5MB

export const formatClientUploadFiles = (
  filesArray: File[],
  maxFileSize = DEFAULT_UPLOAD_MAX_SIZE,
) => {
  return Promise.all(
    filesArray.map(async (file) => {
      const isImageFile = checkFileTypeIsImage(file)
      let icon = 'file'
      let base64Data = ''
      // image, svg, gif
      if (isImageFile) {
        icon = 'image'
        base64Data = (await file2base64(file)) || ''
      }
      const uploadFile = {
        id: uuidV4(),
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        base64Data,
        blobUrl: URL.createObjectURL(file),
        uploadStatus: 'idle',
        uploadErrorMessage: '',
        uploadProgress: 0,
        icon,
      } as IChatUploadFile
      // check file size
      if (maxFileSize > 0 && uploadFile.fileSize > maxFileSize) {
        uploadFile.uploadStatus = 'error'
        uploadFile.uploadErrorMessage = `Upload failed: ${
          uploadFile.fileName
        } exceeds the ${(maxFileSize / 1024 / 1024).toFixed(
          0,
        )}MB limit. Please select a smaller file.`
      }
      return uploadFile
    }),
  )
}
