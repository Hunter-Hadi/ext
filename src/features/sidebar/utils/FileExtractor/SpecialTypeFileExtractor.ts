import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { MaxAIAddOrUpdateUploadFile } from '@/features/chatgpt/hooks/upload/useAIProviderUpload'
import { FileExtractorResult } from '@/features/sidebar/utils/FileExtractor/index'

type SpecialType = 'pdf'

class SpecialTypeFileExtractor {
  private pdfInstance: Record<string, any> | null = null

  constructor() {
    this.pdfInstance = null
  }

  // 判断文件列表是否有需要特殊处理的文件
  isSpecialTypeFile(file: File) {
    if (!file) {
      return false
    }
    return this.getSpecialTypeFile(file) !== undefined
  }

  getSpecialTypeFile(file: File): SpecialType | undefined {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return 'pdf'
    }
    return undefined
  }

  async extractFile(
    file: File,
    maxAIAddOrUpdateFile: MaxAIAddOrUpdateUploadFile,
  ): Promise<FileExtractorResult> {
    try {
      const fileId = uuidV4()
      const blobUrl = URL.createObjectURL(file)
      if (this.getSpecialTypeFile(file) === 'pdf') {
        // 初始化pdfjs
        if (!this.pdfInstance) {
          await new Promise((resolve) => {
            try {
              import(
                Browser.runtime.getURL('/assets/pdfjs/build/pdf.mjs')
              ).then((pdfjs) => {
                pdfjs.GlobalWorkerOptions.workerSrc = Browser.runtime.getURL(
                  '/assets/pdfjs/build/pdf.worker.mjs',
                )
                if (pdfjs) {
                  this.pdfInstance = pdfjs
                  resolve(true)
                }
              })
            } catch (e) {
              // do nothing
              resolve(false)
            }
          })
        }
        maxAIAddOrUpdateFile(fileId, {
          id: fileId,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'text/plain',
          uploadStatus: 'uploading',
          uploadProgress: 0,
          icon: 'file',
        })
        const PDFContent = await new Promise<string>((resolve) => {
          if (this.pdfInstance) {
            this.pdfInstance
              .getDocument(blobUrl)
              .promise.then(async (pdf: any) => {
                const totalPages = pdf.numPages
                const getPDFPageContents = async (pageNum: number) => {
                  try {
                    const pageInstance = await pdf.getPage(pageNum)
                    const textContents = await pageInstance.getTextContent()
                    // https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html
                    // hasEOL: boolean - 是否有换行符
                    // str: string - 文本内容
                    let pageTextContent = ''
                    textContents.items.forEach(
                      (item: { hasEOL: boolean; str: string }) => {
                        pageTextContent += item.str
                        if (item.hasEOL) {
                          pageTextContent += '\n'
                        }
                      },
                    )
                    return pageTextContent
                  } catch (e) {
                    return ''
                  }
                }
                let PDFContent = ''
                for (let i = 0; i < totalPages; i++) {
                  if (i > 0) {
                    PDFContent += '\n'
                  }
                  PDFContent += await getPDFPageContents(i + 1)
                  // computed tokens
                  const process = ((i + 1) / totalPages) * 100
                  console.log(
                    `SpecialTypeFileExtractor [PDF] process [${process}], page [${i}]`,
                  )
                  if (process % 10 === 0) {
                    await maxAIAddOrUpdateFile(fileId, {
                      uploadProgress: process,
                    })
                  }
                }
                resolve(PDFContent)
              })
          } else {
            resolve('')
          }
        })
        if (PDFContent) {
          await maxAIAddOrUpdateFile(fileId, {
            uploadStatus: 'success',
            uploadProgress: 100,
            extractedContent: PDFContent,
          })
          return {
            success: true,
            error: '',
            chatUploadFile: {
              id: fileId,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type || 'text/plain',
              blobUrl: '',
              uploadStatus: 'success',
              uploadProgress: 100,
              uploadedUrl: blobUrl,
              extractedContent: PDFContent,
              uploadedFileId: fileId,
              icon: 'file',
            },
          }
        } else {
          await maxAIAddOrUpdateFile(fileId, {
            uploadStatus: 'error',
            uploadProgress: 0,
          })
        }
      }
    } catch (e) {
      console.error(`SpecialTypeFileExtractor error: \t`, e)
    }
    return {
      success: false,
      error: 'No file to extract',
      chatUploadFile: {
        id: '',
        fileName: '',
        fileSize: 0,
        fileType: '',
      },
    }
  }
}

export default new SpecialTypeFileExtractor()
