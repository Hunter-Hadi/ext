import { IChatUploadFile } from '@/features/chatgpt/types'
import {
  IShortcutEngineExternalEngine,
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { maxAIFileUpload } from '@/features/shortcuts/utils/MaxAIFileUpload'

/**
 * 上传插件PDF viewer的文件到服务器
 * @since - 2024-01-24
 * @description - 考虑到速度和第一个版本，直接异步上传就行了
 */
export class ActionUploadPDFOfCRX extends Action {
  static type: ActionIdentifier = 'UPLOAD_PDF_OF_CRX'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    const { clientConversationEngine } = engine
    const conversationId =
      engine.clientConversationEngine?.currentConversationIdRef?.current || ''
    const uploadPDFAsync = async () => {
      try {
        const pdfInstance = (window as any)?.PDFViewerApplication
        const pdfDocument = pdfInstance?.pdfDocument
        const pdfFilename = document.title || 'file.pdf'
        const unit8Array = await pdfDocument.getData()
        const fileBlob = new Blob([unit8Array], {
          type: 'application/pdf',
        })
        const file = new File([fileBlob], pdfFilename, {
          type: 'application/pdf',
        })
        const response = await maxAIFileUpload(file, {
          useCase: 'summary',
          filename: pdfFilename,
        })
        if (response.success && response.file_id && response.file_url) {
          const uploadedFile: IChatUploadFile = {
            id: response.file_id,
            fileName: pdfFilename,
            fileType: 'application/pdf',
            fileSize: file.size,
            uploadedFileId: response.file_id,
            uploadProgress: 100,
            uploadedUrl: response.file_url,
          }
          await clientConversationEngine?.updateConversation(
            {
              meta: {
                attachments: [uploadedFile],
              },
            },
            conversationId,
            true,
          )
          return uploadedFile
        }
        return undefined
      } catch (e) {
        return undefined
      }
    }
    try {
      if (
        clientConversationEngine &&
        conversationId &&
        typeof window !== 'undefined' &&
        (window as any)?.PDFViewerApplication?.pdfDocument
      ) {
        if (
          typeof window !== 'undefined' &&
          (window as any)?.PDFViewerApplication?.pdfDocument
        ) {
          // NOTE: 上传失败就算了，不能影响后续的action运行
          // 考虑到速度和第一个版本，直接异步上传就行了
          uploadPDFAsync().then().catch()
        } else {
          this.output = ''
        }
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
