import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { clientGetContextMenuRunActions } from '@/features/contextMenu/utils/clientButtonSettings'
export class ActionFetchActions extends Action {
  static type = 'FETCH_ACTIONS'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, 'FETCH_ACTIONS', parameters, autoExecute)
  }
  async execute(params: ActionParameters, engine: any) {
    try {
      const shortCutsEngine = engine.getShortCutsEngine()
      const actions = await clientGetContextMenuRunActions(
        this.parameters.template || '',
      )
      shortCutsEngine.pushActions(actions, 'after')
      this.output = params.LAST_AI_OUTPUT || ''
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}