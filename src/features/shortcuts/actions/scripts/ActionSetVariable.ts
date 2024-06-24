import {
  IShortcutEngineExternalEngine,
  parametersParserDecorator,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
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
  @parametersParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const Variable =
        this.parameters.VariableName || this.parameters.Variable || ''
      const VariableLabel = this.parameters.VariableLabel || undefined
      if (!Variable) {
        this.error = 'Action no variable name!'
        return
      }
      console.log(`engine.shortcutsEngine:`, engine.shortcutsEngine)
      console.log(`params:`, params)
      console.log(`Variable:`, Variable)

      if (engine.shortcutsEngine?.setVariable) {
        if (typeof Variable === 'string') {
          console.log(11111)

          engine.shortcutsEngine.setVariable({
            key: Variable as string,
            value:
              this.parameters?.WFFormValues?.Value ||
              params.LAST_ACTION_OUTPUT ||
              '',
            overwrite: true,
            label: VariableLabel,
            isBuiltIn: false,
          })
          this.output = params.LAST_ACTION_OUTPUT || ''
        } else {
          console.log(22222)
          engine.shortcutsEngine.setVariable(Variable as IShortCutsParameter)
          this.output = (Variable as IShortCutsParameter).value
        }
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
