import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'
import {
  IShortcutEngineExternalEngine,
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { maxAIFileUpload } from '@/features/shortcuts/utils/MaxAIFileUpload'

/**
 * 上传插件PDF viewer的文件到服务器
 * @since - 2024-01-24
 * @description - 考虑到速度和第一个版本，直接异步上传就行了
 * @deprecated - 已废弃，现在所有上传逻辑统一走ActionMaxAIUploadDocument
 */
export class ActionUploadPDFOfCRX extends Action {
  static type: ActionIdentifier = 'UPLOAD_PDF_OF_CRX'
  isStopAction = false
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
      engine.clientConversationEngine?.currentConversationId || ''
    const uploadPDFAsync = async () => {
      try {
        const pdfInstance = (window as any)?.PDFViewerApplication
        const pdfDocument = pdfInstance?.pdfDocument
        const pdfFilename = document.title || 'file.pdf'
        if (this.isStopAction) return undefined
        const unit8Array = await pdfDocument.getData()
        if (this.isStopAction) return undefined
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
        if (this.isStopAction) return undefined
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
          if (this.isStopAction) return
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
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.isStopAction = true
    await stopActionMessageStatus(params)
    return true
  }
}
