import isObject from 'lodash-es/isObject'

import {
  IShortcutEngineExternalEngine,
  parametersParserDecorator,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * 设置变量
 * @description - 设置变量
 * @example
 * ```
 * {
 *    type: 'SCRIPTS_DICTIONARY',
 *    parameters: {
 *      ActionDictionary: {
 *        hello: 'world!',
 *        myNum: 7,
 *        myArray: ['a', 'b', 'c', 'etc'],
 *        myObj: {
 *          anotherString: 'How deep does this thing go?',
 *        }
 *      }
 *    }
 * }
 * ```
 * @hasOutput true
 *
 */
export const MAXAI_BUILT_IN_ACTION_DICTIONARY_KEY =
  'MAXAI_BUILT_IN_ACTION_DICTIONARY_KEY'
export class ActionDictionary extends Action {
  static type: ActionIdentifier = 'SCRIPTS_DICTIONARY'

  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }

  @parametersParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      // TODO: Implement dictionary serialization
      // const Dictionary = this.parameters.ActionDictionary || {}
      // this.output = buildSerialization(Dictionary)
      const { shortcutsEngine } = engine
      console.log(`SCRIPTS_DICTIONARYparams:`, params)
      const dictionary =
        this.parameters.ActionDictionary || params.LAST_ACTION_OUTPUT || {}
      if (!isObject(dictionary)) {
        throw new Error('Dictionary is required')
      }
      console.log(`dictionary111:`, dictionary)

      const variable: IShortCutsParameter = {
        label: 'MaxAI Built-in Action Dictionary',
        key: MAXAI_BUILT_IN_ACTION_DICTIONARY_KEY,
        value: dictionary,
        overwrite: true,
        isBuiltIn: true,
      }
      shortcutsEngine?.setVariable(variable)
      this.output = dictionary
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
