import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export class ActionSetVariable extends Action {
  static type: ActionIdentifier = 'SET_VARIABLE'
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
      const VariableName =
        this.parameters.VariableName || this.parameters.Variable || ''
      if (!VariableName) {
        this.error = 'Action no variable name!'
        return
      }
      if (engine.shortcutsEngine?.setVariable) {
        engine.shortcutsEngine.setVariable({
          key: VariableName as string,
          value:
            this.parameters?.WFFormValues?.Value ||
            params.LAST_ACTION_OUTPUT ||
            '',
          overwrite: true,
        })
        this.output = params.LAST_ACTION_OUTPUT || ''
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
