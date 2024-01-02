import { v4 as uuidV4 } from 'uuid'

import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { fakeLangChainSummarization } from '@/features/shortcuts/langchain/chains/sumarization'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import SummarizeActionType from '@/features/shortcuts/types/Extra/SummarizeActionType'
import { getSliceEnd } from '@/features/shortcuts/utils/tokenizer'
export const SUMMARIZE_MAX_CHARACTERS = 6000

export class ActionSummarizeOfText extends Action {
  static type: ActionIdentifier = 'SUMMARIZE_OF_TEXT'
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
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const needSummarizeText = params.LAST_ACTION_OUTPUT || ''
      const summarizeType = this.parameters.SummarizeActionType || 'STUFF'
      if (!needSummarizeText) {
        this.error = 'No text to summarize'
        return
      }
      const { actions } = await createSummarizeOfTextRunActions(
        needSummarizeText,
        summarizeType as SummarizeActionType,
        this.parameters.SliceTextActionType === 'TOKENS'
          ? await getSliceEnd(
              needSummarizeText,
              this.parameters.SliceTextActionTokens,
            )
          : this.parameters.SliceTextActionLength || SUMMARIZE_MAX_CHARACTERS,
      )
      if (engine.shortcutsEngine) {
        engine.shortcutsEngine.pushActions(
          actions.map((action) => {
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
      this.output = ''
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}

export const createSummarizeOfTextRunActions = async (
  needSummarizeText: string,
  type: SummarizeActionType,
  maxCharacters: number,
) => {
  const id = uuidV4()
  const addActions: ISetActionsType = []
  const { docs } = await fakeLangChainSummarization(
    needSummarizeText,
    maxCharacters,
  )
  if (type === 'STUFF' || type === 'REFINE') {
    // stuff/refine
    // TODO refine 还没做，所以逻辑和stuff一样
    // 截取除了第一个以外的doc
    docs.splice(1)
  }
  // 原理是分割成多个part，然后每个part都进行summarize，最后合并
  let partTemplate = ''
  const partCount = Math.ceil(maxCharacters / docs.length)
  // docs 代表有n个part
  if (docs.length === 1) {
    // 只有一个part，结果设置为SUMMARIZE_TEXT_ID_${id}就行
    addActions.push({
      type: 'ASK_CHATGPT',
      parameters: {
        template: `Disregard any previous instructions.

I will give you text content (potentially just a portion of an article), you will write a concise summary of the text content. Keep the meaning the same. The summary must be ${partCount} characters (characters, not words) or less.
 
In your response, do not remind me of what I asked, do not explain, do not self reference, do not apologize, do not use variables or placeholders, do not include any generic filler phrases, do not quote your response, just output the summary be and nothing else.

Now, using the concepts above, summarize the following text in the same language variety or dialect as the original text:
"""
${docs[0].pageContent}
"""`,
      },
    })
  } else {
    // 多个part，需要用SUMMARIZE_TEXT_ID_${id}_PART_${partIndex}来逐个总结，最后设置SUMMARIZE_TEXT_ID_${id}为所有part的总结
    docs.forEach(({ pageContent }, partIndex) => {
      const part = pageContent || ''
      if (!part) {
        return
      }
      addActions.push({
        type: 'ASK_CHATGPT',
        parameters: {
          template: `Disregard any previous instructions.

I will give you text content (potentially just a portion of an article), you will write a concise summary of the text content. Keep the meaning the same. The summary must be ${partCount} characters (characters, not words) or less.
 
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
          VariableName: `SUMMARIZE_TEXT_PART_${partIndex}_ID_${id}`,
        },
      })
      // debug
      // partTemplate += `[${
      //   partIndex + 1
      // }] {{SUMMARIZE_TEXT_PART_${partIndex}_ID_${id}}}\n`
      partTemplate += `{{SUMMARIZE_TEXT_PART_${partIndex}_ID_${id}}}\n`
    })
    // 总结所有的part变成`SUMMARIZE_TEXT_ID_${id}`
    addActions.push({
      type: 'ASK_CHATGPT',
      parameters: {
        template: `Disregard any previous instructions.

I will give you text content (probably an article), you will write a concise summary of the text content. Keep the meaning the same. The summary must be ${maxCharacters} characters (characters, not words) or less.
 
In your response, do not remind me of what I asked, do not explain, do not self reference, do not apologize, do not use variables or placeholders, do not include any generic filler phrases, do not quote your response, just output the summary be and nothing else.

Now, using the concepts above, summarize the following text in the same language variety or dialect as the original text:
"""
${partTemplate}
"""`,
      },
    })
  }
  addActions.push({
    type: 'SET_VARIABLE',
    parameters: {
      VariableName: `SUMMARIZE_TEXT_ID_${id}`,
    },
  })
  return {
    variableName: `SUMMARIZE_TEXT_ID_${id}`,
    actions: addActions,
  }
}
