import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * 遍历List, 要求前面的Action必须是List
 */
export class ActionRepeatWithEach extends Action {
  static type: ActionIdentifier = 'REPEAT_WITH_EACH'
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
      const list = params.LAST_ACTION_OUTPUT || []
      if (!Array.isArray(list)) {
        this.error = 'List is required'
      }
      // const actions = this.parameters.ActionRepeatWithEachActions || []
      // 最大并发数
      const concurrentLimit =
        this.parameters.ActionRepeatWithEachConcurrentLimit || 1
      // const tasks = []
      // 每次执行[concurrentLimit]个actions
      for (let i = 0; i < list.length; i += concurrentLimit) {
        // 并发执行
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
