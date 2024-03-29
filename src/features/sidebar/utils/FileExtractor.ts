import { v4 as uuidV4 } from 'uuid'

import { checkFileNameIsImage } from '@/background/utils/uplpadFileProcessHelper'
import { IChatUploadFile } from '@/features/chatgpt/types'
import globalSnackbar from '@/utils/globalSnackbar'
interface FileInfo {
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
    if (
      !result &&
      !checkFileNameIsImage(fileName) &&
      !fileName.includes('.pdf')
    ) {
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
    }
    return result
  }

  public static extractFile(file: File | null): Promise<FileInfo> {
    return new Promise((resolve, reject) => {
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
      // 获取文件名的后缀
      if (!this.canExtractTextFromFileName(file.name)) {
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

      const reader = new FileReader()

      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          // 读取文件失败
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
        const fileId = uuidV4()
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
