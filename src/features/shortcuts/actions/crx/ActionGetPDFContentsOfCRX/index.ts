import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { v4 as uuidV4 } from 'uuid'
import { pushOutputToChat, templateParserDecorator } from '@/features/shortcuts'
import { getTextTokens } from '@/features/shortcuts/utils/tokenizer'
export class ActionGetPDFContentsOfCRX extends Action {
  static type = 'GET_PDF_CONTENTS_OF_CRX'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'GET_PDF_CONTENTS_OF_CRX', parameters, autoExecute)
  }
  @templateParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(params: ActionParameters, engine: any) {
    try {
      this.pushMessageToChat(
        {
          type: 'system',
          text: `Generating summary...`,
          messageId: uuidV4(),
          extra: {
            status: 'info',
          },
        },
        engine,
      )
      if (
        typeof window !== 'undefined' &&
        (window as any).pdfjsLib &&
        (window as any)?.PDFViewerApplication?.url
      ) {
        const pdfLib = (window as any).pdfjsLib
        const maxPDFTokens = this.parameters.SliceTextActionTokens || 4096
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
              if (partOfPDFContentsToken + useTokens > maxPDFTokens) {
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
        // TODO 支持控制最大数量
        const PDFPageContent = await fetchPageContents()
        const { getShortCutsEngine, getChartGPT } = engine
        if (getShortCutsEngine()?.getNextAction?.()?.type === 'ASK_CHATGPT') {
          const conversationId = engine.getChartGPT()?.getSidebarRef()
            ?.currentConversationIdRef?.current
          // 因为是总结, 更新system prompt
          await getChartGPT()?.updateConversation(
            {
              meta: {
                systemPrompt: `The following text delimited by triple backticks is the context text:
\`\`\`
${PDFPageContent}
\`\`\``,
              },
            },
            conversationId,
          )
        }
        this.output = PDFPageContent
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}