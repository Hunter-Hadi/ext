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
export class ActionGetPDFContentsOfCRX extends Action {
  static type: ActionIdentifier = 'GET_PDF_CONTENTS_OF_CRX'
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
      if (
        typeof window !== 'undefined' &&
        (window as any)?.PDFViewerApplication?.pdfDocument
      ) {
        const fetchPageContents = async () => {
          try {
            console.log('ActionGetPDFContentsOfCRX start fetchPageContents')
            const pdfInstance = (window as any)?.PDFViewerApplication
              .pdfDocument
            const totalPages = pdfInstance?.numPages
            console.log(`ActionGetPDFContentsOfCRX totalPages: \t`, totalPages)
            const getPDFPageContents = async (pageNum: number) => {
              try {
                if (this.isStopAction) return ''
                const pageInstance = await pdfInstance.getPage(pageNum)
                if (this.isStopAction) return ''
                const textContents = await pageInstance.getTextContent()
                if (this.isStopAction) return ''
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
                console.error(
                  `ActionGetPDFContentsOfCRX getPDFPageContents error: \t`,
                  e,
                )
                return ''
              }
            }
            let PDFContent = ''
            for (let i = 0; i < totalPages; i++) {
              if (i > 0) {
                PDFContent += '\n'
              }
              if (this.isStopAction) return
              PDFContent += await getPDFPageContents(i + 1)
              if (this.isStopAction) return
              // computed tokens
              const process = ((i + 1) / totalPages) * 100
              console.log(
                `ActionGetPDFContentsOfCRX process [${process}], page [${i}]`,
              )
            }
            return PDFContent
          } catch (e) {
            console.error(`ActionGetPDFContentsOfCRX error: \t`, e)
            return ''
          }
        }
        if (this.isStopAction) return
        const PDFPageContent = await fetchPageContents()
        this.output = PDFPageContent
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
