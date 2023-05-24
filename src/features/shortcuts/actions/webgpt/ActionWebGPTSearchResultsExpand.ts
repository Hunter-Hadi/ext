import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { SearchResult } from '@/features/shortcuts/actions/web/ActionGetContentsOfSearchEngine'
import { limitedPromiseAll } from '@/features/shortcuts/utils'
import { IShortCutsSendEvent } from '@/features/shortcuts/background/eventType'

// MARK: 这只是为了webget的业务实现的，不具备通用性
export class ActionWebGPTSearchResultsExpand extends Action {
  static type = 'WEBGPT_SEARCH_RESULTS_EXPAND'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'WEBGPT_SEARCH_RESULTS_EXPAND', parameters, autoExecute)
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
      const searchResults: SearchResult[] = JSON.parse(searchResultJson)
      const expandResults = await Promise.all<SearchResult>(
        searchResults.map(async (searchResult) => {
          try {
            const response = await backgroundConversation.postMessage({
              event: 'ShortCuts_getContentOfURL' as IShortCutsSendEvent,
              data: {
                URL: searchResult.url,
              },
            })
            return {
              ...searchResult,
              content: response?.data?.body || '',
            }
          } catch (e) {
            return {
              ...searchResult,
              content: (e as any).toString(),
            }
          }
        }),
      )
      debugger
      console.log(expandResults)
      this.output = JSON.stringify(expandResults)
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
