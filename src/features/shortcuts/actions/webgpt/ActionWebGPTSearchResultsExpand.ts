import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { ICrawlingSearchResult } from '@/features/shortcuts/utils/searchEngineCrawling'

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
      const searchResults: ICrawlingSearchResult[] = JSON.parse(
        searchResultJson,
      )
      let template = ``
      const addActions: ISetActionsType = []
      for (let i = 0; i < searchResults.length; i++) {
        const searchResult = searchResults[i]
        // NOTE: 特殊处理 给webgppt用的
        if (summarizeType === 'NO_SUMMARIZE') {
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
          template += `NUMBER:${i + 1}\nURL: ${searchResult.url}\nTITLE: ${
            searchResult.title
          }\nCONTENT: {{SLICE_OF_TEXT_${i}}}\n\n`
        }
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
}
