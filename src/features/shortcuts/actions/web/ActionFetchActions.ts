import { clientGetContextMenuRunActions } from '@/features/contextMenu/utils/clientButtonSettings'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
export class ActionFetchActions extends Action {
  static type: ActionIdentifier = 'FETCH_ACTIONS'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const actions = await clientGetContextMenuRunActions(
        this.parameters.template || '',
      )
      engine.shortcutsEngine?.pushActions(actions, 'after')
      debugger
      this.output = params.LAST_AI_OUTPUT || ''
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
