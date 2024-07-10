import isNumber from 'lodash-es/isNumber'
import uniqBy from 'lodash-es/uniqBy'
import { v4 as uuidV4 } from 'uuid'

import {
  completeLastAIMessageOnError,
  completeLastAIMessageOnStop,
  IShortcutEngineExternalEngine,
} from '@/features/shortcuts'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import Action from '@/features/shortcuts/core/Action'
import {
  parametersParserDecorator,
  pushOutputToChat,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import URLSearchEngine from '@/features/shortcuts/types/IOS_WF/URLSearchEngine'
import { clientAbortFetchAPI } from '@/features/shortcuts/utils'
import {
  crawlingSearchResults,
  ICrawlingKnowledge,
} from '@/features/shortcuts/utils/searchEngineCrawling'
import clientGetContentOfURL from '@/features/shortcuts/utils/web/clientGetContentOfURL'
import { interleaveMerge } from '@/utils/dataHelper/arrayHelper'

export interface SearchResponse {
  status: number
  html: string
  url: string
}

// MARK: 这只是为了webget的业务实现的，不具备通用性
export class ActionGetContentsOfSearchEngine extends Action {
  static type = 'GET_CONTENTS_OF_SEARCH_ENGINE'
  /**
   * 搜索引擎默认的搜索结果数量
   * @private
   */
  private SearchEngineResultDefaultLimit = 6
  private searchEngineTaskMap: Map<string, boolean>
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'GET_CONTENTS_OF_SEARCH_ENGINE', parameters, autoExecute)
    this.searchEngineTaskMap = new Map<string, boolean>()
  }

  private isTaskAbort(abortTaskId: string) {
    return this.searchEngineTaskMap.get(abortTaskId) || false
  }

  @parametersParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  @withLoadingDecorators()
  @completeLastAIMessageOnError()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      let query = String(
        this.parameters?.compliedTemplate ||
          this.parameters?.URLSearchEngineParams?.q ||
          this.parameters?.URLSearchEngineParams?.query ||
          params.LAST_ACTION_OUTPUT ||
          '',
      )
      if (query) {
        // remove head and tail space
        query = query.trim()

        const isCopilot = this.parameters.isCopilot || false
        // remove head end quote
        if (query.startsWith('"') && query.endsWith('"')) {
          query = query.slice(1, -1)
        }
        const searchEngine = this.parameters.URLSearchEngine || 'yahoo'
        const searchParams = this.parameters.URLSearchEngineParams || {}
        const limit = isNumber(Number(searchParams?.limit))
          ? Number(searchParams?.limit)
          : this.SearchEngineResultDefaultLimit
        let queryArr = [query]
        if (searchParams.splitWith && query.includes(searchParams.splitWith)) {
          queryArr = query.split(searchParams.splitWith)
          delete searchParams.splitWith
        }
        let isManualStop = false
        let videosSource: Array<{
          src: string
          originSrc: string
          imgSrc: string
        }> = []
        let knowledgeSource: ICrawlingKnowledge | undefined
        const searchResultArr = await Promise.all(
          queryArr.map(async (itemQuery) => {
            // 0. 给每个searchResult设置一个abortTaskId
            const abortTaskId = uuidV4()
            this.searchEngineTaskMap.set(abortTaskId, false)
            const fullSearchURL = this.getFullSearchURL(
              searchEngine,
              searchParams,
              itemQuery.trim(),
            )
            const { html, status, videos } = await clientGetContentOfURL(
              fullSearchURL,
              {
                timeout: 20 * 1000,
                abortTaskId,
                needImage: false,
                needVideo: isCopilot,
              },
            )

            if (videos) videosSource = [...videosSource, ...videos]
            if (this.isTaskAbort(abortTaskId)) {
              isManualStop = true
              // 任务被中止
              return []
            }
            if (
              status === 301 ||
              status === 302 ||
              status === 429 ||
              status === 404
            ) {
              // search engine 被重定向
              // 目前默认为 301，需要人机验证
              this.error = `[Click here for ${searchEngine.replace(/^\w/, (c) =>
                c.toUpperCase(),
              )}.](${fullSearchURL}) Pass security checks and keep the tab open for stable web access.`
              return []
            }
            console.log(`fullSearchURL:`, fullSearchURL)

            // response is success
            if (status === 200 && html) {
              let result = crawlingSearchResults({
                html,
                searchEngine,
                searchQuery: itemQuery,
                needKnowledge: isCopilot,
              })
              // console.log(`result111:`, result)
              // 抽出搜索结果中的knowledgePanel
              if (isCopilot) {
                result = result.map((item) => {
                  const { knowledgePanel, ...rest } = item
                  if (!knowledgeSource && knowledgePanel)
                    knowledgeSource = knowledgePanel
                  return rest
                })
              }
              return result
              // return crawlingSearchResults({
              //   html,
              //   searchEngine,
              //   searchQuery: itemQuery,
              //   needKnowledge: isCopilot,
              // })
            }
            return []
          }),
        )
        // 如果是手动停止，不需要继续执行
        if (isManualStop) {
          this.output = '[]'
          this.error = ''
          return
        }
        if (this.error) {
          // 有错误，不需要继续执行
          return
        }
        const mergedSearchResult = uniqBy(
          interleaveMerge(...searchResultArr),
          'url',
        )
        const slicedSearchResult = mergedSearchResult.slice(0, limit)

        let mergedVideosSource: Array<{
          src: string
          originSrc: string
          imgSrc: string
        }> = []
        if (isCopilot) {
          // sources如果是youtube视频，转化成视频增强资源
          const sourcesVideo: any[] = []
          slicedSearchResult.forEach((searchResult) => {
            const youtubeVideoId = YoutubeTranscript.retrieveVideoId(
              searchResult.url,
            )
            if (youtubeVideoId) {
              sourcesVideo.push({
                src: `https://www.youtube.com/embed/${youtubeVideoId}`,
                originSrc: searchResult.url,
                imgSrc: `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`,
              })
            }
          })
          videosSource = [...videosSource, ...sourcesVideo]

          // 视频资源去重
          mergedVideosSource = uniqBy(videosSource, 'src')
        }

        if (slicedSearchResult.length <= 0) {
          // 根据搜索结果爬取不到 内容
          this.output = {
            SEARCH_SOURCES: '[]',
            VIDEO_SOURCES: mergedVideosSource,
            KNOWLEDGE_SOURCES: knowledgeSource,
          }
          // this.output = '[]'
          this.error =
            'No search results found. Please try again with a different search engine or search query.'
        } else {
          this.error = ''
          // 正确获取到搜索结果，和爬取到的内容
          this.output = {
            SEARCH_SOURCES: JSON.stringify(slicedSearchResult, null, 2),
            VIDEO_SOURCES: mergedVideosSource,
            KNOWLEDGE_SOURCES: knowledgeSource,
          }
          // this.output = JSON.stringify(slicedSearchResult, null, 2)
        }
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
  @completeLastAIMessageOnStop()
  async stop(): Promise<boolean> {
    // 停止所有的总结任务
    this.searchEngineTaskMap.forEach((isEnd, key) => {
      if (!isEnd) {
        clientAbortFetchAPI(key)
        this.searchEngineTaskMap.set(key, true)
      }
    })
    return true
  }
  private getFullSearchURL(
    engine: URLSearchEngine | string,
    params: any,
    query: string,
  ) {
    const searchURL = getSearchURL(engine)
    const searchParams = getSearchParams(engine, params, query)

    return `${searchURL}?${searchParams.toString()}`
  }
}

function getSearchParams(
  engine: URLSearchEngine | string,
  params: any,
  query: string,
) {
  const cloneParams = { ...params }
  delete cloneParams.limit

  let newQuery = query || cloneParams.query
  delete cloneParams.query
  delete cloneParams.q

  if (cloneParams.site) {
    newQuery = `site:${cloneParams.site} ${newQuery}`
  }
  delete cloneParams.site

  if (cloneParams.region && cloneParams.region !== 'wt-wt') {
    if (engine === 'google') {
      newQuery = `location:${cloneParams.region} ${newQuery}`
    } else {
      newQuery = `${cloneParams.region} ${newQuery}`
    }

    delete cloneParams.region
  }

  switch (engine) {
    case 'yahoo': {
      cloneParams.p = newQuery
      break
    }

    case 'baidu': {
      cloneParams.wd = newQuery
      break
    }

    case 'naver':
    case 'sogou': {
      cloneParams.query = newQuery
      break
    }

    case 'yandex': {
      cloneParams.text = newQuery
      break
    }

    case 'bing':
    case 'duckduckgo':
    case 'brave':
    case 'google':
    default: {
      // default query field is q
      cloneParams.q = newQuery
    }
  }

  const searchParams = new URLSearchParams({
    ...cloneParams,
  })

  return searchParams
}

function getSearchURL(engine: URLSearchEngine | string) {
  switch (engine) {
    case 'google':
      return 'https://www.google.com/search'
    case 'bing':
      return 'https://www.bing.com/search'
    case 'baidu':
      return 'https://www.baidu.com/s'
    case 'duckduckgo':
      return 'https://duckduckgo.com/'
    case 'yahoo':
      return 'https://search.yahoo.com/search'
    case 'naver':
      return 'https://search.naver.com/search.naver'
    case 'yandex':
      return 'https://yandex.com/search/'
    case 'sogou':
      return 'https://www.sogou.com/web'
    case 'brave':
      return 'https://search.brave.com/search'
    case 'reddit':
      return 'https://www.reddit.com/search'
    case 'twitter':
      return 'https://twitter.com/search'
    case 'youtube':
      return 'https://www.youtube.com/results'
    case 'amazon':
      return 'https://www.amazon.com/s'
    default:
      // default yahoo search engine
      return 'https://search.yahoo.com/search'
  }
}
