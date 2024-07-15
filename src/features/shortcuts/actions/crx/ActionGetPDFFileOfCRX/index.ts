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

/**
 * 从PDF viewer获取文件
 * @since - 2024-07-12
 * @description - 此actions读取pdf data转成file对象
 */
export class ActionGetPDFFileOfCRX extends Action {
  static type: ActionIdentifier = 'GET_PDF_FILE_OF_CRX'

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
    try {
      const { clientConversationEngine } = engine
      const conversationId =
        engine.clientConversationEngine?.currentConversationId || ''
      if (
        clientConversationEngine &&
        conversationId &&
        typeof window !== 'undefined' &&
        (window as any)?.PDFViewerApplication?.pdfDocument
      ) {
        const pdfInstance = (window as any)?.PDFViewerApplication
        const pdfDocument = pdfInstance?.pdfDocument
        const pdfFilename = document.title || 'file.pdf'

        if (this.isStopAction) return

        const unit8Array = await pdfDocument.getData()

        if (this.isStopAction) return

        const fileBlob = new Blob([unit8Array], {
          type: 'application/pdf',
        })
        const file = new File([fileBlob], pdfFilename, {
          type: 'application/pdf',
        })
        this.output = file
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
