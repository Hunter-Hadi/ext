import lodashGet from 'lodash-es/get'

import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import { MAXAI_BUILT_IN_ACTION_DICTIONARY_KEY } from '@/features/shortcuts/actions/scripts/dictionaries/ActionDictionary'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * 获取字典值
 * @description - 获取字典值
 * @example
 * ```
 *  {
 *    type: 'SCRIPTS_GET_DICTIONARY_VALUE',
 *    parameters: {
 *      ActionGetDictionaryKey: 'value',
 *      ActionGetDictionaryValue: 'myArray[2].q[4].b',
 *    },
 *  },
 * ```
 * @hasOutput true
 *
 */
export class ActionGetDictionaryValue extends Action {
  static type: ActionIdentifier = 'SCRIPTS_GET_DICTIONARY_VALUE'

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
      const { shortcutsEngine } = engine
      const getDictionaryKey = this.parameters.ActionGetDictionaryKey || 'value'
      const getDictionaryValue = this.parameters.ActionGetDictionaryValue || ''
      const dictionary = shortcutsEngine?.getVariable(
        MAXAI_BUILT_IN_ACTION_DICTIONARY_KEY,
      )
      if (!dictionary) {
        throw new Error('Dictionary is required')
      }
      const dictionaryValue = dictionary.value
      if (getDictionaryKey === 'value') {
        if (getDictionaryValue) {
          this.output = lodashGet(dictionaryValue, getDictionaryValue, '')
        } else {
          this.output = dictionaryValue
        }
      } else if (getDictionaryKey === 'allKeys') {
        this.output = Object.keys(dictionary)
      } else if (getDictionaryKey === 'allValues') {
        this.output = Object.values(dictionary)
      } else {
        this.error = 'Invalid getDictionaryKey'
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
