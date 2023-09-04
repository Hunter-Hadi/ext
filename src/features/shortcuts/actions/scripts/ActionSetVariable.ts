import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { pushOutputToChat } from '@/features/shortcuts/decorators'

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
  async execute(params: ActionParameters, engine: any) {
    try {
      const VariableName =
        this.parameters.VariableName || this.parameters.Variable || ''
      if (!VariableName) {
        this.error = 'Action no variable name!'
        return
      }
      const shortCutsEngine = engine.getShortCutsEngine()
      if (shortCutsEngine && shortCutsEngine.setVariable) {
        shortCutsEngine.setVariable(
          VariableName,
          this.parameters?.WFFormValues?.Value ||
            params.LAST_ACTION_OUTPUT ||
            '',
          true,
        )
        this.output = params.LAST_ACTION_OUTPUT || ''
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
