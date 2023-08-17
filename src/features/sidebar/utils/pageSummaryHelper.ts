import { md5TextEncrypt } from '@/utils/encryptionHelper'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
import { getPageContentWithPostlightParser } from '@/features/shortcuts/utils/pageContentHelper'

export type IPageSummaryType = 'PAGE_SUMMARY'

export const PAGE_SUMMARY_CONTEXT_MENU_MAP: {
  [key in IPageSummaryType]: IContextMenuItem
} = {
  PAGE_SUMMARY: {
    id: 'f734efe5-c63e-490e-a0f1-ae5a248e0f16',
    parent: 'root',
    droppable: false,
    text: 'Summarize page',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'ASK_CHATGPT',
          parameters: {
            template: `Ignore all previous instructions. You are a highly proficient researcher that can write fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the context text delimited by triple backticks in all relevant aspects. 

Output a summary and a list of key takeaways respectively. The summary should be a one-liner in at most 100 words. The key takeaways should be  in up to five bulletpoints, and pick a good matching emoji for every bullet point.

Use the following format:
## Summary
<summary of the text>

## Key Takeaways
<list of key takeaways>

Respond in {{AI_RESPONSE_LANGUAGE}}.`,
          },
        },
      ],
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
    },
  },
}

const getCurrentPageUrl = () => {
  const pageUrl = window.location.href
  // remove hash or query
  const url = pageUrl.split('#')[0].split('?')[0]
  return url
}

export const getPageSummaryConversationId = () => {
  return md5TextEncrypt(getCurrentPageUrl())
}
export const getPageSummaryType = (): IPageSummaryType => {
  return 'PAGE_SUMMARY'
}

export const generatePageSummaryData = async (
  maxPageContentTokens?: number,
): Promise<{
  pageSummaryId: string
  pageSummaryContent: string
  pageSummaryType: IPageSummaryType
}> => {
  // 提取网页内容
  const pageContent = await getPageContentWithPostlightParser(
    window.location.href,
  )
  const md5 = md5TextEncrypt(pageContent)
  return {
    pageSummaryId: md5,
    pageSummaryContent: maxPageContentTokens
      ? await sliceTextByTokens(pageContent, maxPageContentTokens)
      : pageContent,
    pageSummaryType: 'PAGE_SUMMARY',
  }
}
