import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { SearchResult } from '@/features/shortcuts/actions/web/ActionGetContentsOfSearchEngine'
import { IShortCutsSendEvent } from '@/features/shortcuts/background/eventType'
import { fakeLangChainSummarization } from '@/features/shortcuts/langchain/chains/sumarization'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

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
              body: response?.data?.body || '',
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
        const { docs } = await fakeLangChainSummarization(searchResult.body)
        // docs 代表有0-10个part
        let partTemplate = ''
        docs.forEach(({ pageContent }, partIndex) => {
          const part = pageContent || ''
          if (!part) {
            return
          }
          addActions.push({
            type: 'ASK_CHATGPT',
            parameters: {
              template: `
Disregard any previous instructions.

I will give you text content (potentially just a portion of an article), you will write a concise summary of the text content. Keep the meaning the same. The summary must be 200 characters (characters, not words) or less.
 
In your response, do not remind me of what I asked, do not explain, do not self reference, do not apologize, do not use variables or placeholders, do not include any generic filler phrases, do not quote your response, just output the summary be and nothing else.

Now, using the concepts above, summarize the following text in the same language variety or dialect as the original text:
"""
${part}
"""`,
            },
          })
          addActions.push({
            type: 'SET_VARIABLE',
            parameters: {
              VariableName: `PAGE_SUMMARIZE_${i}_PART_${partIndex}`,
            },
          })
          partTemplate += `[${
            partIndex + 1
          }] {{PAGE_SUMMARIZE_${i}_PART_${partIndex}}}\n`
        })
        // 总结所有的part变成`PAGE_SUMMARIZE_${i}`
        addActions.push({
          type: 'ASK_CHATGPT',
          parameters: {
            template: `
Disregard any previous instructions.

I will give you text content (probably an article), you will write a concise summary of the text content. Keep the meaning the same. The summary must be 200 characters (characters, not words) or less.
 
In your response, do not remind me of what I asked, do not explain, do not self reference, do not apologize, do not use variables or placeholders, do not include any generic filler phrases, do not quote your response, just output the summary be and nothing else.

Now, using the concepts above, summarize the following text in the same language variety or dialect as the original text:
"""
${partTemplate}
"""`,
          },
        })
        addActions.push({
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: `PAGE_SUMMARIZE_${i}`,
          },
        })
        template += `[${i + 1}] Title: ${
          searchResult.title
        }\nContent: {{PAGE_SUMMARIZE_${i}}}\nURL: ${searchResult.url}\n\n`
        console.log(docs, i)
      }
      addActions.push({
        type: 'RENDER_CHATGPT_PROMPT',
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
