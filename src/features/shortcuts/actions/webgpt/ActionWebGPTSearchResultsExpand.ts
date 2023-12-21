import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/constants'
import clientAskMaxAIChatProvider from '@/features/chatgpt/utils/clientAskMaxAIChatProvider'
import { ActionAskChatGPT } from '@/features/shortcuts/actions'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import { IShortCutsSendEvent } from '@/features/shortcuts/messageChannel/eventType'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { ICrawlingSearchResult } from '@/features/shortcuts/utils/searchEngineCrawling'
import { textHandler } from '@/features/shortcuts/utils/textHelper'
import {
  getTextTokens,
  MAX_CHARACTERS_TOKENS,
  sliceTextByTokens,
} from '@/features/shortcuts/utils/tokenizer'

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

  @withLoadingDecorators()
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
              let response: any = undefined
              // 判断是不是youtube
              const youtubeVideoId = YoutubeTranscript.retrieveVideoId(
                searchResult.url,
              )
              if (youtubeVideoId) {
                const postContextData = await YoutubeTranscript.fetchYoutubePageContentWithoutDocument(
                  youtubeVideoId,
                )
                if (postContextData.SOCIAL_MEDIA_PAGE_CONTENT) {
                  response = {
                    data: {
                      success: true,
                      body: postContextData.SOCIAL_MEDIA_PAGE_CONTENT,
                      title: postContextData.post?.title,
                    },
                  }
                }
              } else {
                response = await backgroundConversation.postMessage({
                  event: 'ShortCuts_getContentOfURL' as IShortCutsSendEvent,
                  data: {
                    URL: searchResult.url,
                    timeOut: 20 * 1000, // 20s
                    // 暂时不使用 google snapshot
                    // withSnapshot: true,
                  },
                })
              }
              // 2. 获取页面内容成功时，用页面内容替换 body、title
              if (response.data.success) {
                searchResult.body = response.data.body || searchResult.body
                searchResult.title = response.data.title || searchResult.title
                // 3. 获取页面内容成功时，才会进行异步总结
                // 根据 MAX_CHARACTERS_TOKENS ，计算出每次总结结果的长度
                const partOfPageSummaryTokensLimit = Math.floor(
                  MAX_CHARACTERS_TOKENS / searchResults.length,
                )
                const bodyTokens = (await getTextTokens(searchResult.body))
                  .length
                if (bodyTokens > partOfPageSummaryTokensLimit) {
                  // 网页内容的长度超过了每次总结的长度，需要进行总结
                  const summarizeResult = await this.createWebpageSummary(
                    searchResult,
                    summarizePrompt,
                    partOfPageSummaryTokensLimit,
                    params.AI_RESPONSE_LANGUAGE ||
                      DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
                  )
                  searchResult.body = textHandler(summarizeResult.data, {
                    trim: true,
                    noSummaryTag: true,
                  })
                  // 确保总结后的长度不会超过每次总结的长度
                  searchResult.body = (
                    await sliceTextByTokens(
                      searchResult.body,
                      partOfPageSummaryTokensLimit,
                    )
                  ).text
                }
              }
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
    aiResponseLanguage: string,
  ) {
    let messageContent = prompt
      .replaceAll('{{SMART_QUERY}}', pageContent.searchQuery || '')
      .replaceAll('{{WEBPAGE_URL}}', pageContent.url)
      .replaceAll('{{NUMBER_OF_WORDS}}', `${maxTokens}`)
      .replaceAll('{{WEBPAGE_CONTENT}}', `${pageContent.body}`)
    // 基于AI的智能补充
    const additionalText = await ActionAskChatGPT.generateAdditionalText({
      PAGE_CONTENT: pageContent.body,
      AI_RESPONSE_LANGUAGE: aiResponseLanguage,
    })
    if (additionalText.addPosition === 'end') {
      messageContent += additionalText.data + '\n\n'
    } else {
      messageContent = additionalText.data + '\n\n' + messageContent
    }
    return await clientAskMaxAIChatProvider(
      'USE_CHAT_GPT_PLUS',
      'gpt-3.5-turbo-16k',
      {
        message_content: messageContent,
        prompt_id: 'cae761b7-3703-4ff9-83ab-527b7a24e53b',
        prompt_name: '[Search] smart page',
      },
    )
  }
}
