import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  parametersParserDecorator,
  pushOutputToChat,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import { IShortCutsSendEvent } from '@/features/shortcuts/messageChannel/eventType'
import URLSearchEngine from '@/features/shortcuts/types/IOS_WF/URLSearchEngine'
import { crawlingSearchResults } from '@/features/shortcuts/utils/searchEngineCrawling'

export interface SearchResponse {
  status: number
  html: string
  url: string
}

// MARK: 这只是为了webget的业务实现的，不具备通用性
export class ActionGetContentsOfSearchEngine extends Action {
  static type = 'GET_CONTENTS_OF_SEARCH_ENGINE'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'GET_CONTENTS_OF_SEARCH_ENGINE', parameters, autoExecute)
  }

  @parametersParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  @withLoadingDecorators()
  async execute(params: ActionParameters, engine: any) {
    try {
      let query =
        params.compliedTemplate ||
        this.parameters?.URLSearchEngineParams?.q ||
        this.parameters?.URLSearchEngineParams?.query ||
        params.LAST_ACTION_OUTPUT ||
        ''
      const backgroundConversation = engine.getBackgroundConversation()
      if (query && backgroundConversation) {
        // await this.pushMessageToChat(
        //   {
        //     messageId: uuidV4(),
        //     extra: {
        //       status: 'info',
        //     },
        //     type: 'system',
        //     text: `The extension is crawling this page: ${query}. Note that if the crawled text is too long, it'll be trimmed to the first 7,000 characters to fit the context limit.`,
        //   },
        //   engine,
        // )
        // remove head and tail space
        query = query.trim()

        // remove head end quote
        if (query.startsWith('"') && query.endsWith('"')) {
          query = query.slice(1, -1)
        }
        const searchEngine = this.parameters.URLSearchEngine || 'yahoo'
        const searchParams = this.parameters.URLSearchEngineParams || {}
        const fullSearchURL = this.getFullSearchURL(
          searchEngine,
          searchParams,
          query,
        )
        const response = await backgroundConversation.postMessage({
          event: 'ShortCuts_getContentOfSearchEngine' as IShortCutsSendEvent,
          data: {
            URL: fullSearchURL,
          },
        })
        const { status, html } = (response.data || {}) as SearchResponse
        if (response.success && status === 200 && html) {
          // response is success
          const searchResult = crawlingSearchResults({
            html,
            searchEngine,
            limit: Number(searchParams?.limit || 3),
            fullSearchURL,
            query,
          })
          if (searchResult.length <= 0) {
            // 根据搜索结果爬取不到 内容
            this.output = ''
            this.error =
              'No search results found. Please try again with a different search engine or search query.'
            return
          } else {
            // 正确获取到搜索结果，和爬取到的内容
            this.output = JSON.stringify(searchResult, null, 2)
            return
          }
        }
        // response is error
        this.error = 'Failed to access the search page. Please try again.'
        if (status === 301) {
          // search engine 被重定向
          // 目前默认为 301，需要人机验证
          this.output = ''
          this.error = `<a href="${fullSearchURL}" target="_blank" style="color: inherit">Click here for ${searchEngine.replace(
            /^\w/,
            (c) => c.toUpperCase(),
          )}</a>. Pass security checks and keep the tab open for stable web access.`
          return
        }
      }
      if (!this.output) {
        this.output = ''
        this.error =
          'No search results found. Please try again with a different search engine or search query.'
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
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
