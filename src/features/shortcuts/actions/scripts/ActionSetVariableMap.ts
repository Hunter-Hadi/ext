import {
  IShortcutEngineExternalEngine,
  parametersParserDecorator,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
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
  @parametersParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const VariableMap = this.parameters.VariableMap || {}
      if (engine.shortcutsEngine?.setVariable) {
        Object.keys(VariableMap).forEach((VariableName) => {
          if (VariableMap[VariableName] !== undefined) {
            if ((VariableMap[VariableName] as IShortCutsParameter)?.key) {
              // 说明是一个变量对象
              engine.shortcutsEngine!.setVariable(
                VariableMap[VariableName] as IShortCutsParameter,
              )
            } else {
              // 说明是值
              engine.shortcutsEngine!.setVariable({
                key: VariableName,
                value: VariableMap[VariableName],
                overwrite: true,
              })
            }
          }
        })
        this.output = JSON.stringify(VariableMap)
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
