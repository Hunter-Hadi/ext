import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { IShortCutsSendEvent } from '@/features/shortcuts/messageChannel/eventType'
import URLSearchEngine from '@/features/shortcuts/types/IOS_WF/URLSearchEngine'
import cheerio from 'cheerio'
import { v4 as uuidV4 } from 'uuid'

export interface SearchResult {
  title: string
  body: string
  url: string
}
export interface SearchResponse {
  status: number
  html: string
  url: string
}

// NOTE: 这只是为了webget的业务实现的，不具备通用性
export class ActionGetContentsOfSearchEngine extends Action {
  static type: ActionIdentifier = 'GET_CONTENTS_OF_SEARCH_ENGINE'
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
      let query =
        params.compliedTemplate ||
        params.LAST_ACTION_OUTPUT ||
        this.parameters?.URLSearchEngineParams?.q ||
        this.parameters?.URLSearchEngineParams?.query ||
        ''
      const backgroundConversation = engine.getBackgroundConversation()
      if (query && backgroundConversation) {
        this.pushMessageToChat(
          {
            type: 'system',
            text: `MaxAI.me extension is crawling this page: ${query}. Note that if the crawled text is too long, it'll be trimmed to the first 7,000 characters to fit the context limit.`,
            messageId: uuidV4(),
            extra: {
              status: 'info',
            },
          },
          engine,
        )
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
          const searchResult = this.getSearchResults({
            html,
            limit: Number(searchParams?.limit || 3),
            searchEngine,
          })
          if (searchResult.length <= 0) {
            // 根据搜索结果爬取不到 内容
            this.output = ''
            this.error =
              'No search results found. Please try a different query.'
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
          this.error = `<a href="${fullSearchURL}" target="_blank" style="color: inherit">Click here to pass the security check</a> and try again.`
          return
        }
      }
      if (!this.output) {
        this.output = ''
        this.error = 'Could not search the page.\nMake sure the URL is correct.'
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
    const searchURL = getSearchURL(engine, params?.region)
    const searchParams = getSearchParams(engine, params, query)

    return `${searchURL}?${searchParams.toString()}`
  }

  private getSearchResults({
    html,
    limit,
    searchEngine,
  }: {
    html: string
    limit: number
    searchEngine: URLSearchEngine | string
  }) {
    try {
      switch (searchEngine) {
        case 'yahoo': {
          const $ = cheerio.load(html)
          const results: SearchResult[] = []
          const rightPanel = $('#right .searchRightTop')
          if (rightPanel.length) {
            const rightPanelLink = rightPanel.find('.compText a').first()
            const rightPanelInfo = rightPanel.find('.compInfo li')
            const rightPanelInfoText = rightPanelInfo
              .map((_, el) => $(el).text().trim())
              .get()
              .join('\n')

            results.push({
              title: rightPanelLink.text().trim(),
              body: `${rightPanel.find('.compText').text().trim()}${
                rightPanelInfoText ? `\n\n${rightPanelInfoText}` : ''
              }`,
              url: this.extractRealUrl(rightPanelLink.attr('href') ?? ''),
            })
          }
          $('.algo-sr:not([class*="ad"])')
            .slice(0, limit)
            .each((_, el) => {
              const element = $(el)
              const titleElement = element.find('h3.title a')

              results.push({
                title: titleElement.attr('aria-label') ?? '',
                body: element.find('.compText').text().trim(),
                url: this.extractRealUrl(titleElement.attr('href') ?? ''),
              })
            })
          return results
        }
        case 'google': {
          const $ = cheerio.load(html)
          const results: SearchResult[] = []

          const rightPanel = $('#rhs')
          if (rightPanel && rightPanel.length) {
            const rightPanelTitle = rightPanel
              .find('h2[data-attrid="title"]')
              .text()
              .trim()
            const rightPanelLink = rightPanel.find('.kno-rdesc a[href]')
            const rightPanelInfo = rightPanel.find('div.wp-ms').text().trim()

            results.push({
              title: rightPanelTitle,
              body: rightPanelInfo,
              url: this.extractRealUrl(rightPanelLink.attr('href') ?? ''),
            })
          }
          $('#search #rso > div')
            .filter((_, el) => !!$(el).find('a > h3').text())
            .slice(0, limit)
            .each((_, el) => {
              const element = $(el)
              const titleElement = element.find('a > h3')

              results.push({
                title: titleElement.text().trim() ?? '',
                body: element.find('div.MUxGbd').text().trim(),
                url: this.extractRealUrl(
                  titleElement.closest('a').attr('href') ?? '',
                ),
              })
            })
          return results
        }
        default:
          return []
      }
    } catch (error) {
      return []
    }
  }
  private extractRealUrl(url: string) {
    const match = url.match(/RU=([^/]+)/)
    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }

    return url
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

  if (cloneParams.region && cloneParams.region !== 'wt-wt') {
    if (engine === 'google') {
      newQuery = `location:${cloneParams.region} ${newQuery}`
    } else {
      newQuery = `${cloneParams.region} ${newQuery}`
    }

    delete cloneParams.region
  }

  if (engine === 'yahoo') {
    cloneParams.p = newQuery
  }

  const searchParams = new URLSearchParams({
    ...cloneParams,
    // default query
    q: newQuery,
  })

  return searchParams
}

function getSearchURL(engine: URLSearchEngine | string, region = 'wt-wt') {
  switch (engine) {
    case 'google':
      return 'https://www.google.com/search'
    case 'yahoo':
      return 'https://search.yahoo.com/search'
    case 'baidu':
      return 'https://www.baidu.com/s'
    case 'bing':
      return 'https://www.bing.com/search'
    case 'duckduckgo':
      return 'https://duckduckgo.com'
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
