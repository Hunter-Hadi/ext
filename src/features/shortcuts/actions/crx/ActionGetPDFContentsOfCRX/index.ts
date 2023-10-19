import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts'
import { getTextTokens } from '@/features/shortcuts/utils/tokenizer'
import { MAX_UPLOAD_TEXT_FILE_TOKENS } from '@/features/shortcuts/utils/stringConvertTxtUpload'
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
        (window as any).pdfjsLib &&
        (window as any)?.PDFViewerApplication?.url
      ) {
        const pdfLib = (window as any).pdfjsLib
        let useTokens = 0
        const fetchPageContents = async () => {
          try {
            const pdfInstance = await pdfLib.getDocument(
              (window as any)?.PDFViewerApplication?.url,
            ).promise
            const totalPages = pdfInstance.numPages
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
            let startPDFContent = ''
            let endPDFContent = ''
            let loadPageCount = 0
            for (let i = 0; i < totalPages; i++) {
              let partOfPDFContents = ''
              let isSliceEnd = false
              // 先从尾部获取
              if (i % 2 === 0) {
                isSliceEnd = true
                partOfPDFContents = await getPDFPageContents(totalPages - i)
              } else {
                partOfPDFContents = await getPDFPageContents(i)
              }
              const partOfPDFContentsToken = (
                await getTextTokens(partOfPDFContents)
              ).length
              if (
                partOfPDFContentsToken + useTokens >
                MAX_UPLOAD_TEXT_FILE_TOKENS
              ) {
                // 自2023-09-08之后，太长的PDF内容用上传文件的最大tokens来middle out
                break
              }
              loadPageCount += 1
              useTokens += partOfPDFContentsToken
              if (isSliceEnd) {
                endPDFContent = partOfPDFContents + endPDFContent
              } else {
                startPDFContent = startPDFContent + partOfPDFContents
              }
            }
            console.log(
              `ActionGetPDFContentsOfCRX using [${useTokens}] tokens, loaded [${loadPageCount}] page. result: \n`,
              startPDFContent,
              endPDFContent,
            )
            return startPDFContent + endPDFContent
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
