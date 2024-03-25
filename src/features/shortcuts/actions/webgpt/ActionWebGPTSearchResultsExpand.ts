import { v4 as uuidV4 } from 'uuid'

import { DEFAULT_AI_OUTPUT_LANGUAGE_VALUE } from '@/constants'
import clientAskMaxAIChatProvider from '@/features/chatgpt/utils/clientAskMaxAIChatProvider'
import {
  completeLastAIMessageOnError,
  completeLastAIMessageOnStop,
  IShortcutEngineExternalEngine,
} from '@/features/shortcuts'
import generatePromptAdditionalText from '@/features/shortcuts/actions/chat/ActionAskChatGPT/generatePromptAdditionalText'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { clientAbortFetchAPI } from '@/features/shortcuts/utils'
import { ICrawlingSearchResult } from '@/features/shortcuts/utils/searchEngineCrawling'
import { textHandler } from '@/features/shortcuts/utils/textHelper'
import {
  getTextTokens,
  MAX_CHARACTERS_TOKENS,
  sliceTextByTokens,
} from '@/features/shortcuts/utils/tokenizer'
import clientGetContentOfURL from '@/features/shortcuts/utils/web/clientGetContentOfURL'

// import { SLICE_MAX_CHARACTERS } from '@/features/shortcuts/actions/documents/ActionSliceOfText'

// NOTE: 这只是为了WebGPT的业务实现的，不具备通用性
export class ActionWebGPTSearchResultsExpand extends Action {
  static type: ActionIdentifier = 'WEBGPT_SEARCH_RESULTS_EXPAND'
  private pageSummaryTaskMap: Map<string, boolean>
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
    this.pageSummaryTaskMap = new Map<string, boolean>()
  }

  private isTaskAbort(abortTaskId: string) {
    return this.pageSummaryTaskMap.get(abortTaskId) || false
  }

  @withLoadingDecorators()
  @pushOutputToChat({
    onlyError: true,
  })
  @completeLastAIMessageOnError()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const searchResultJson = params.LAST_ACTION_OUTPUT
      if (!searchResultJson || !engine.shortcutsMessageChannelEngine) {
        this.error = 'no search result'
        return
      }
      const summarizeType =
        this.parameters.SummarizeActionType || 'NO_SUMMARIZE'
      // 需要用来总结的prompt
      const summarizePrompt = this.parameters.template || ''
      const searchResults: ICrawlingSearchResult[] =
        JSON.parse(searchResultJson)
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
              // 0. 给每个searchResult设置一个abortTaskId
              const abortTaskId = uuidV4()
              this.pageSummaryTaskMap.set(abortTaskId, false)
              const fallbackData = {
                url: '',
                body: '',
                title: '',
              }
              // 1. 根据 url 获取页面内容
              let pageRawContent: {
                success: boolean
                body: string
                title: string
              } = {
                success: false,
                body: '',
                title: '',
              }
              // 判断是不是youtube
              const youtubeVideoId = YoutubeTranscript.retrieveVideoId(
                searchResult.url,
              )
              if (youtubeVideoId) {
                const postContextData =
                  await YoutubeTranscript.fetchYoutubePageContentWithoutDocument(
                    youtubeVideoId,
                    abortTaskId,
                  )
                if (this.isTaskAbort(abortTaskId)) {
                  // 如果abort, 返回 fallbackData
                  return fallbackData
                }
                if (postContextData.SOCIAL_MEDIA_PAGE_CONTENT) {
                  pageRawContent = {
                    success: true,
                    body: postContextData.SOCIAL_MEDIA_PAGE_CONTENT,
                    title: postContextData.post?.title || '',
                  }
                }
              } else {
                const result = await clientGetContentOfURL(
                  searchResult.url,
                  20 * 1000,
                  abortTaskId,
                )
                if (this.isTaskAbort(abortTaskId)) {
                  // 如果abort, 返回 fallbackData
                  return fallbackData
                }
                pageRawContent.success = result.success
                pageRawContent.body = result.readabilityText
                pageRawContent.title = result.title
              }
              // 2. 获取页面内容成功时，用页面内容替换 body、title
              if (pageRawContent.success) {
                searchResult.body = pageRawContent.body || searchResult.body
                searchResult.title = pageRawContent.title || searchResult.title
                // 3. 获取页面内容成功时，才会进行异步总结
                // 根据 MAX_CHARACTERS_TOKENS ，计算出每次总结结果的长度
                const partOfPageSummaryTokensLimit = Math.floor(
                  MAX_CHARACTERS_TOKENS / searchResults.length,
                )
                const bodyTokens = (await getTextTokens(searchResult.body))
                  .length
                if (this.isTaskAbort(abortTaskId)) {
                  // 如果abort, 返回 fallbackData
                  return fallbackData
                }
                if (bodyTokens > partOfPageSummaryTokensLimit) {
                  this.pageSummaryTaskMap.set(abortTaskId, false)
                  // 网页内容的长度超过了每次总结的长度，需要进行总结
                  const summarizeResult = await this.createWebpageSummary(
                    searchResult,
                    summarizePrompt,
                    partOfPageSummaryTokensLimit,
                    params.AI_RESPONSE_LANGUAGE ||
                      DEFAULT_AI_OUTPUT_LANGUAGE_VALUE,
                    abortTaskId,
                  )
                  if (this.isTaskAbort(abortTaskId)) {
                    // 如果abort, 返回 fallbackData
                    return fallbackData
                  }
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
      if (engine.shortcutsEngine) {
        engine.shortcutsEngine.pushActions(addActions, 'after')
      } else {
        this.error = 'no shortCutsEngine'
        return
      }
      this.output = template
    } catch (e) {
      this.error = (e as any).toString()
    } finally {
      // 清空任务
      this.pageSummaryTaskMap.clear()
    }
  }

  @completeLastAIMessageOnStop()
  async stop(): Promise<boolean> {
    // 停止所有的总结任务
    this.pageSummaryTaskMap.forEach((isEnd, key) => {
      if (!isEnd) {
        clientAbortFetchAPI(key)
        this.pageSummaryTaskMap.set(key, true)
      }
    })
    return true
  }

  private async createWebpageSummary(
    pageContent: ICrawlingSearchResult,
    prompt: string,
    maxTokens: number,
    aiResponseLanguage: string,
    abortTaskId: string,
  ) {
    let messageContent = prompt
      .replaceAll('{{SMART_QUERY}}', pageContent.searchQuery || '')
      .replaceAll('{{WEBPAGE_URL}}', pageContent.url)
      .replaceAll('{{NUMBER_OF_WORDS}}', `${maxTokens}`)
      .replaceAll('{{WEBPAGE_CONTENT}}', `${pageContent.body}`)
    // 基于AI的智能补充
    const additionalText = await generatePromptAdditionalText({
      PAGE_CONTENT: pageContent.body,
      AI_RESPONSE_LANGUAGE: aiResponseLanguage,
    })
    if (additionalText.addPosition === 'start') {
      messageContent = additionalText.data + '\n\n' + messageContent
    } else {
      messageContent += '\n\n' + additionalText.data
    }
    return await clientAskMaxAIChatProvider(
      'USE_CHAT_GPT_PLUS',
      'gpt-4',
      {
        message_content: [
          {
            type: 'text',
            text: messageContent,
          },
        ],
        prompt_id: 'cae761b7-3703-4ff9-83ab-527b7a24e53b',
        prompt_name: '[Search] smart page',
      },
      abortTaskId,
    )
  }
}
