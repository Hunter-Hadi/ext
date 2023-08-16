import Browser from 'webextension-polyfill'
import { getCurrentDomainHost } from '@/utils'
import { md5TextEncrypt } from '@/utils/encryptionHelper'
import { IContextMenuItem } from '@/features/contextMenu/types'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'

const PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY =
  'MAXAI_PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY'

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

export const getPageSummaryConversationId = async () => {
  try {
    const pageUrl = getCurrentPageUrl()
    const cache = await Browser.storage.local.get(
      PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY,
    )
    if (cache && cache[PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY]) {
      const cacheData = JSON.parse(cache[PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY])
      return cacheData[pageUrl]
    } else {
      return ''
    }
  } catch (e) {
    console.log(e)
    return ''
  }
}

export const setPageSummaryConversationId = async (conversationId: string) => {
  try {
    const pageUrl = window.location.href
    // remove hash or query
    const url = pageUrl.split('#')[0].split('?')[0]
    const cache = await Browser.storage.local.get(
      PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY,
    )
    if (cache && cache[PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY]) {
      const cacheData = JSON.parse(cache[PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY])
      cacheData[url] = conversationId
      await Browser.storage.local.set({
        [PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY]: JSON.stringify(cacheData),
      })
      return true
    } else {
      await Browser.storage.local.set({
        [PAGE_SUMMARY_LOCAL_STORAGE_SAVE_KEY]: JSON.stringify({
          [url]: conversationId,
        }),
      })
      return true
    }
  } catch (e) {
    console.log(e)
    return false
  }
}

export type IInitPageSummaryData = {
  id: string
  host: string
  pageContent: string
  md5?: string
  type: IPageSummaryType
}

export const generateInitPageSummaryData = async (
  maxPageContentTokens = 12000,
): Promise<IInitPageSummaryData> => {
  const host = getCurrentDomainHost()
  const htmlText = document.body.innerText
  // TODO
  const md5 = md5TextEncrypt(getCurrentPageUrl())
  return {
    id: await getPageSummaryConversationId(),
    host,
    pageContent: await sliceTextByTokens(htmlText, maxPageContentTokens),
    md5,
    type: 'PAGE_SUMMARY',
  }
}
