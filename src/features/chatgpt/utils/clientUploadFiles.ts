import { v4 as uuidV4 } from 'uuid'

import {
  checkFileTypeIsImage,
  file2base64,
} from '@/background/utils/uplpadFileProcessHelper'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'

export const formatClientUploadFiles = (filesArray: File[]) => {
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
      return uploadFile
    }),
  )
}
