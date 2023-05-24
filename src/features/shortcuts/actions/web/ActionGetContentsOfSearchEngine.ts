import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { IShortCutsSendEvent } from '@/features/shortcuts/background/eventType'
import URLSearchEngine from '@/features/shortcuts/types/IOS_WF/URLSearchEngine'
import cheerio from 'cheerio'

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

// TODO 这只是为了webget的业务实现的，不具备通用性
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
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(params: ActionParameters, engine: any) {
    try {
      const query =
        params.compliedTemplate ||
        params.LAST_ACTION_OUTPUT ||
        this.parameters?.URLSearchEngineParams?.q ||
        this.parameters?.URLSearchEngineParams?.query ||
        ''
      debugger
      const backgroundConversation = engine.getBackgroundConversation()
      if (query && backgroundConversation) {
        this.pushMessageToChat(
          {
            type: 'third',
            text: `The extension is crawling this page: ${query}. Note that if the crawled text is too long, it'll be trimmed to the first 7,000 characters to fit the context limit.`,
          },
          engine,
        )
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
        if (response.success) {
          const { status, html } = response.data as SearchResponse
          if (status === 200 && html) {
            this.output = JSON.stringify(
              this.getSearchResults({
                html,
                limit: Number(searchParams?.limit || 3),
                searchEngine,
              }),
            )
            return
          }
        }
        this.output =
          'Could not search the page.\nMake sure the URL is correct.'
      } else {
        this.error = 'Could not search the page.\nMake sure the URL is correct.'
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
    const searchURL = this.getSearchURL(engine)
    const cloneParams = { ...params }
    delete cloneParams.limit
    const searchParams = new URLSearchParams({
      ...params,
      q: query,
    })
    return `${searchURL}?${searchParams.toString()}`
  }
  private getSearchURL(engine: URLSearchEngine | string) {
    switch (engine) {
      case 'google':
        return 'https://www.google.com/search'
      case 'baidu':
        return 'https://www.baidu.com/s'
      case 'bing':
        return 'https://cn.bing.com/search'
      case 'duckduckgo':
        return 'https://duckduckgo.com'
      case 'yahoo':
        return 'https://sg.search.yahoo.com/search'
      case 'reddit':
        return 'https://www.reddit.com/search'
      case 'twitter':
        return 'https://twitter.com/search'
      case 'youtube':
        return 'https://www.youtube.com/results'
      case 'amazon':
        return 'https://www.amazon.com/s'
      default:
        return engine
    }
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
      default:
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
