import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts'
export class ActionGetPDFContentsOfCRX extends Action {
  static type: ActionIdentifier = 'GET_PDF_CONTENTS_OF_CRX'
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
  async execute(params: ActionParameters, engine: any) {
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
                const pageInstance = await pdfInstance.getPage(pageNum)
                const textContents = await pageInstance.getTextContent()
                return textContents.items.map((item: any) => item.str).join('')
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
              PDFContent += await getPDFPageContents(i + 1)
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
        const PDFPageContent = await fetchPageContents()
        this.output = PDFPageContent
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
