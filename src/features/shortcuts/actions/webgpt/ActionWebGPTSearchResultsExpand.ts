import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { ICrawlingSearchResult } from '@/features/shortcuts/utils/searchEngineCrawling'
import { IShortCutsSendEvent } from '@/features/shortcuts/messageChannel/eventType'
import clientAskMaxAIChatProvider from '@/features/chatgpt/utils/clientAskMaxAIChatProvider'
import {
  getTextTokens,
  MAX_CHARACTERS_TOKENS,
  sliceTextByTokens,
} from '@/features/shortcuts/utils/tokenizer'
import { textHandler } from '@/features/shortcuts/utils/textHelper'

// import { SLICE_MAX_CHARACTERS } from '@/features/shortcuts/actions/documents/ActionSliceOfText'

// NOTE: 这只是为了WebGPT的业务实现的，不具备通用性
export class ActionWebGPTSearchResultsExpand extends Action {
  static type: ActionIdentifier = 'WEBGPT_SEARCH_RESULTS_EXPAND'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }

  @pushOutputToChat({
    onlyError: true,
  })
  async execute(params: ActionParameters, engine: any) {
    try {
      const searchResultJson = params.LAST_ACTION_OUTPUT
      const backgroundConversation = engine.getBackgroundConversation()
      if (!searchResultJson || !backgroundConversation) {
        this.error = 'no search result'
        return
      }
      const summarizeType =
        this.parameters.SummarizeActionType || 'NO_SUMMARIZE'
      // 需要用来总结的prompt
      const summarizePrompt = this.parameters.template || ''
      const searchResults: ICrawlingSearchResult[] = JSON.parse(
        searchResultJson,
      )
      let template = ``
      const addActions: ISetActionsType = []
      if (summarizeType === 'NO_SUMMARIZE') {
        for (let i = 0; i < searchResults.length; i++) {
          const searchResult = searchResults[i]
          // NOTE: 特殊处理 给webgppt用的
          addActions.push({
            type: 'RENDER_TEMPLATE',
            parameters: {
              template: searchResult.body,
            },
          })
          addActions.push({
            type: 'SET_VARIABLE',
            parameters: {
              VariableName: `SLICE_OF_TEXT_${i}`,
            },
          })
          // 需要遍历往 template 添加[搜索结果]
          template += `NUMBER:${i + 1}\nURL: ${searchResult.url}\nTITLE: ${
            searchResult.title
          }\nCONTENT: {{SLICE_OF_TEXT_${i}}}\n\n`
        }
      } else if (summarizeType === 'MAP_REDUCE') {
        const expandResults = await Promise.all<ICrawlingSearchResult>(
          searchResults.map(async (searchResult) => {
            try {
              // 1. 根据 url 获取页面内容
              const response = await backgroundConversation.postMessage({
                event: 'ShortCuts_getContentOfURL' as IShortCutsSendEvent,
                data: {
                  URL: searchResult.url,
                  timeOut: 20 * 1000, // 20s
                  // 暂时不使用 google snapshot
                  // withSnapshot: true,
                },
              })
              // 2. 获取页面内容成功时，用页面内容替换 body、title
              let body = searchResult.body || ''
              let title = searchResult.title || ''
              if (response.data.success) {
                // 3. 获取页面内容成功时，才会进行异步总结
                // 根据 MAX_CHARACTERS_TOKENS ，计算出每次总结结果的长度
                const partOfPageSummaryTokensLimit = Math.floor(
                  MAX_CHARACTERS_TOKENS / searchResults.length,
                )
                body = response?.data?.body || body
                title = response?.data?.title || title
                const bodyTokens = (await getTextTokens(body)).length
                if (bodyTokens > partOfPageSummaryTokensLimit) {
                  // 网页内容的长度超过了每次总结的长度，需要进行总结
                  const summarizeResult = await this.createWebpageSummary(
                    searchResult,
                    summarizePrompt,
                    partOfPageSummaryTokensLimit,
                  )
                  body = textHandler(summarizeResult.data, {
                    trim: true,
                    noSummaryTag: true,
                  })
                  // 确保总结后的长度不会超过每次总结的长度
                  body = await sliceTextByTokens(
                    body,
                    partOfPageSummaryTokensLimit,
                  )
                }
              }
              searchResult.title = title
              searchResult.body = body
              return searchResult
            } catch (e) {
              console.error(e)
              return searchResult
            }
          }),
        )
        // 需要遍历往 template 添加[搜索结果的网页内容的总结]
        expandResults.forEach((expandItem, index) => {
          template += `NUMBER:${index + 1}\nURL: ${expandItem.url}\nTITLE: ${
            expandItem.title
          }\nCONTENT: ${expandItem.body}\n\n`
        })
      }
      addActions.push({
        type: 'RENDER_TEMPLATE',
        parameters: {
          template,
        },
      })
      if (engine.getShortCutsEngine()) {
        engine.getShortCutsEngine()?.pushActions(addActions, 'after')
      } else {
        this.error = 'no shortCutsEngine'
        return
      }
      this.output = template
    } catch (e) {
      this.error = (e as any).toString()
    }
  }

  private async createWebpageSummary(
    pageContent: ICrawlingSearchResult,
    prompt: string,
    maxTokens: number,
  ) {
    return await clientAskMaxAIChatProvider(
      'MAXAI_CLAUDE',
      'claude-instant-v1',
      {
        message_content: prompt
          .replaceAll('{{WEBPAGE_URL}}', pageContent.url)
          .replaceAll('{{NUMBER_OF_WORDS}}', `${maxTokens}`)
          .replaceAll('{{WEBPAGE_CONTENT}}', `${pageContent.body}`),
        prompt_id: 'cae761b7-3703-4ff9-83ab-527b7a24e53b',
        prompt_name: '[Search] smart page',
      },
    )
  }
}
