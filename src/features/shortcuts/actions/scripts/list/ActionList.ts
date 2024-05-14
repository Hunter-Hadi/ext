import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * @since 2023-09-12
 * @description 渲染模板，最基础的prompt
 */
export class ActionList extends Action {
  static type: ActionIdentifier = 'SCRIPTS_LIST'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    const list = params.LAST_ACTION_OUTPUT || []
    if (typeof list === 'string') {
      try {
        this.output = JSON.parse(list)
      } catch (e) {
        this.error = `Error parsing list`
      }
    } else if (Array.isArray(list)) {
      this.output = list
    } else {
      this.error = `List is required`
    }
  }
}
