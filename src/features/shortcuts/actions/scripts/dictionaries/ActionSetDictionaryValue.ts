import lodashSet from 'lodash-es/set'

import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import { MAXAI_BUILT_IN_ACTION_DICTIONARY_KEY } from '@/features/shortcuts/actions/scripts/dictionaries/ActionDictionary'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * 获取字典值
 * @description - 获取字典值
 * @example
 * ```
 *  {
 *    type: 'SCRIPTS_SET_DICTIONARY_VALUE',
 *    parameters: {
 *      ActionSetDictionaryKey: 'myArray[2].q[4].b',
 *      ActionSetDictionaryValue: '233',
 *    },
 *  },
 * ```
 * @hasOutput true
 *
 */
export class ActionSetDictionaryValue extends Action {
  static type: ActionIdentifier = 'SCRIPTS_SET_DICTIONARY_VALUE'

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
      const setDictionaryKey = this.parameters.ActionSetDictionaryKey || ''
      const setDictionaryValue = this.parameters.ActionSetDictionaryValue
      const dictionary: IShortCutsParameter = shortcutsEngine?.getVariable(
        MAXAI_BUILT_IN_ACTION_DICTIONARY_KEY,
      )
      if (!dictionary) {
        throw new Error('Dictionary is required')
      }
      const dictionaryValue = dictionary.value
      if (!setDictionaryKey) {
        throw new Error('Key is required')
      }
      if (!setDictionaryValue) {
        throw new Error('Value is required')
      }
      lodashSet(dictionaryValue, setDictionaryKey, setDictionaryValue)
      shortcutsEngine?.setVariable(dictionary)
      this.output = dictionaryValue
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
