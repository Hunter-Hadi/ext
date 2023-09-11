import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { SearchResult } from '@/features/shortcuts/actions/web/ActionGetContentsOfSearchEngine'
import { IShortCutsSendEvent } from '@/features/shortcuts/messageChannel/eventType'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import {
  createSummarizeOfTextRunActions,
  // SUMMARIZE_MAX_CHARACTERS,
} from '@/features/shortcuts/actions/documents/ActionSummarizeOfText'
import SummarizeActionType from '@/features/shortcuts/types/Extra/SummarizeActionType'
import {
  getSliceEnd,
  MAX_CHARACTERS_TOKENS,
  SLICE_BUFFER,
} from '@/features/shortcuts/utils/tokenizer'
// import { SLICE_MAX_CHARACTERS } from '@/features/shortcuts/actions/documents/ActionSliceOfText'

// NOTE: 这只是为了webget的业务实现的，不具备通用性
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
      const searchResults: SearchResult[] = JSON.parse(searchResultJson)
      const summarizeType = this.parameters.SummarizeActionType || 'STUFF'
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
              body: response?.data?.body || searchResult.body || '',
              title: response?.data?.title || searchResult.title || '',
            }
          } catch (e) {
            return {
              ...searchResult,
            }
          }
        }),
      )
      let template = ``
      const addActions: ISetActionsType = []
      for (let i = 0; i < expandResults.length; i++) {
        const searchResult = expandResults[i]
        // NOTE: 特殊处理 给webgppt用的
        if (summarizeType === 'NO_SUMMARIZE') {
          addActions.push({
            type: 'RENDER_CHATGPT_PROMPT',
            parameters: {
              template: searchResult.body,
            },
          })
          addActions.push({
            type: 'SLICE_OF_TEXT',
            parameters: {
              SliceTextActionType: 'TOKENS',
              SliceTextActionTokens: Math.ceil(
                (MAX_CHARACTERS_TOKENS * SLICE_BUFFER) / expandResults.length,
              ),
              // SliceTextActionLength: Math.ceil(
              //   SLICE_MAX_CHARACTERS / expandResults.length,
              // ),
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
        } else {
          const currentResultTextLength = await getSliceEnd(
            searchResult.body,
            MAX_CHARACTERS_TOKENS / expandResults.length,
          )
          const { actions: summarizeActions, variableName } =
            await createSummarizeOfTextRunActions(
              searchResult.body,
              summarizeType as SummarizeActionType,
              // Math.ceil(SUMMARIZE_MAX_CHARACTERS / expandResults.length),
              currentResultTextLength,
            )
          addActions.push(...summarizeActions)
          template += `NUMBER:${i + 1}\nURL: ${searchResult.url}\nTITLE: ${
            searchResult.title
          }\nCONTENT: {{${variableName}}}\n\n`
        }
      }
      addActions.push({
        type: 'RENDER_CHATGPT_PROMPT',
        parameters: {
          template,
        },
      })
      if (engine.getShortCutsEngine()) {
        engine.getShortCutsEngine()?.pushActions(
          addActions.map((action) => {
            return {
              ...action,
              parameters: {
                ...action.parameters,
                AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN',
              },
            }
          }),
          'after',
        )
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
