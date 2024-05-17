import { checkFileNameIsImage } from '@/background/utils/uplpadFileProcessHelper'
import { MaxAIAddOrUpdateUploadFile } from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import SpecialTypeFileExtractor from '@/features/sidebar/utils/FileExtractor/SpecialTypeFileExtractor'
import globalSnackbar from '@/utils/globalSnackbar'

import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message';
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
    fileId: string,
  ): Promise<FileExtractorResult> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const handleUploadError = (error: string) => {
        resolve({
          success: false,
          error,
          chatUploadFile: {
            id: '',
            fileName: file?.name || '',
            fileSize: file?.size || 0,
            fileType: file?.type || '',
          },
        })
      }
      if (!file) {
        handleUploadError('No file to extract')
        return
      }
      if (SpecialTypeFileExtractor.isSpecialTypeFile(file)) {
        SpecialTypeFileExtractor.extractFile(
          file,
          maxAIAddOrUpdateFile,
          fileId,
        ).then(resolve)
        return
      }
      if (!this.canExtractTextFromFileName(file.name)) {
        // 获取文件名的后缀
        handleUploadError(
          `You may not upload files of the following format: (${
            '.' + file.name.split('.').pop()
          }). Try again using a different file format.`,
        )
        return
      }
      const reader = new FileReader()
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
          handleUploadError(
            `You may not upload files of the following format: (${
              '.' + file.name.split('.').pop()
            }). Try again using a different file format.`,
          )
          return
        }
        const blobUrl = URL.createObjectURL(file)
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
        handleUploadError('Failed to read file')
      }
      reader.readAsText(file)
    })
  }
}
export default FileExtractor
