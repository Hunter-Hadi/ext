import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export class ActionSetVariableMap extends Action {
  static type: ActionIdentifier = 'SET_VARIABLE_MAP'
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
      const VariableMap = this.parameters.VariableMap || {}
      const shortCutsEngine = engine.getShortCutsEngine()
      if (shortCutsEngine && shortCutsEngine.setVariable) {
        Object.keys(VariableMap).forEach((VariableName) => {
          if (VariableMap[VariableName] !== undefined) {
            shortCutsEngine?.setVariable(
              VariableName,
              VariableMap[VariableName],
              true,
            )
          }
        })
        this.output = JSON.stringify(VariableMap)
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
