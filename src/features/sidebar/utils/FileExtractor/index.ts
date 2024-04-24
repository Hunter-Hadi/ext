import { v4 as uuidV4 } from 'uuid'

import { checkFileNameIsImage } from '@/background/utils/uplpadFileProcessHelper'
import { MaxAIAddOrUpdateUploadFile } from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import { IChatUploadFile } from '@/features/chatgpt/types'
import SpecialTypeFileExtractor from '@/features/sidebar/utils/FileExtractor/SpecialTypeFileExtractor'
import globalSnackbar from '@/utils/globalSnackbar'
export interface FileExtractorResult {
  success: boolean
  error?: string
  chatUploadFile: IChatUploadFile
}

class FileExtractor {
  private static supportedFileTypes = [
    '.pdf',
    // '.doc',
    // '.docx',
    // '.rtf',
    // '.epub',
    // '.odt',
    // '.odp',
    // '.pptx',
    '.txt',
    '.py',
    '.ipynb',
    '.js',
    '.jsx',
    '.html',
    '.css',
    '.java',
    '.cs',
    '.php',
    '.c',
    '.cpp',
    '.cxx',
    '.h',
    '.hpp',
    '.rs',
    '.R',
    '.Rmd',
    '.swift',
    '.go',
    '.rb',
    '.kt',
    '.kts',
    '.ts',
    '.tsx',
    '.m',
    '.scala',
    '.rs',
    '.dart',
    '.lua',
    '.pl',
    '.pm',
    '.t',
    '.sh',
    '.bash',
    '.zsh',
    '.csv',
    '.log',
    '.ini',
    '.config',
    '.json',
    '.yaml',
    '.yml',
    '.toml',
    '.lua',
    '.sql',
    '.bat',
    '.md',
    '.coffee',
    '.tex',
    '.latex',
    '.uri-list',
  ]
  public static canExtractTextFromFileName(fileName: string): boolean {
    if (!fileName) {
      return false
    }
    const result =
      this.supportedFileTypes.includes('.' + fileName.split('/').pop()) ||
      this.supportedFileTypes.includes('.' + fileName.split('.').pop()) ||
      this.supportedFileTypes.includes('.' + fileName) ||
      this.supportedFileTypes.includes(fileName)
    if (!result && !checkFileNameIsImage(fileName)) {
      globalSnackbar.error(
        `You may not upload files of the following format: (${
          '.' + fileName.split('.').pop()
        }). Try again using a different file format.`,
        {
          autoHideDuration: 3000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right',
          },
        },
      )
      return false
    }
    return result
  }

  public static extractFile(
    file: File | null,
    maxAIAddOrUpdateFile: MaxAIAddOrUpdateUploadFile,
  ): Promise<FileExtractorResult> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (!file) {
        resolve({
          success: false,
          error: 'No file to extract',
          chatUploadFile: {
            id: '',
            fileName: '',
            fileSize: 0,
            fileType: '',
          },
        })
        return
      }
      if (SpecialTypeFileExtractor.isSpecialTypeFile(file)) {
        SpecialTypeFileExtractor.extractFile(file, maxAIAddOrUpdateFile).then(
          resolve,
        )
        return
      }
      if (!this.canExtractTextFromFileName(file.name)) {
        // 获取文件名的后缀
        resolve({
          success: false,
          error: `You may not upload files of the following format: (${file.type}). Try again using a different file format.`,
          chatUploadFile: {
            id: '',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        })
        return
      }

      const fileId = uuidV4()
      const reader = new FileReader()
      await maxAIAddOrUpdateFile(fileId, {
        id: fileId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadStatus: 'uploading',
        uploadProgress: 0,
        icon: 'file',
      })
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100
          maxAIAddOrUpdateFile(fileId, {
            uploadProgress: progress,
          })
        }
      }
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          // 读取文件失败
          maxAIAddOrUpdateFile(fileId, {
            uploadStatus: 'error',
            uploadProgress: 0,
          })
          resolve({
            success: false,
            error: `You may not upload files of the following format: (${file.type}). Try again using a different file format.`,
            chatUploadFile: {
              id: '',
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            },
          })
          return
        }
        const blobUrl = URL.createObjectURL(file)
        maxAIAddOrUpdateFile(fileId, {
          uploadStatus: 'success',
          uploadProgress: 100,
          uploadedUrl: blobUrl,
          extractedContent: reader.result,
          uploadedFileId: fileId,
        })
        resolve({
          success: true,
          error: '',
          chatUploadFile: {
            id: fileId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type || 'text/plain',
            blobUrl,
            uploadStatus: 'success',
            uploadProgress: 100,
            uploadedUrl: blobUrl,
            extractedContent: reader.result,
            uploadedFileId: fileId,
            icon: 'file',
          },
        })
      }

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Error reading file',
          chatUploadFile: {
            id: '',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        })
      }

      reader.readAsText(file)
    })
  }
}
export default FileExtractor
