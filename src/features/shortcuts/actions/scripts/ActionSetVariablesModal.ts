import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
// import { pushOutputToChat } from '@/features/shortcuts/decorators'
import OneShotCommunicator from '@/utils/OneShotCommunicator'
import { intervalFindHtmlElement } from '@/features/contextMenu/utils/runEmbedShortCuts'
import { getAppRootElement } from '@/utils'
import { ActionSetVariablesConfirmData } from '@/features/shortcuts/components/ActionSetVariablesModal'
import {
  shortcutsRenderTemplate,
  templateParserDecorator,
} from '@/features/shortcuts'
import cloneDeep from 'lodash-es/cloneDeep'

export class ActionSetVariablesModal extends Action {
  static type: ActionIdentifier = 'SET_VARIABLES_MODAL'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  // @pushOutputToChat({
  //   onlyError: true,
  // })
  @templateParserDecorator()
  async execute(params: ActionParameters, engine: any) {
    try {
      const config = this.parameters.SetVariablesModalConfig
      if (!config) {
        this.error = 'No config!'
        return
      }
      if (config.modelKey === 'Sidebar') {
        const root = getAppRootElement()
        root &&
          (await intervalFindHtmlElement(
            root,
            '#max-ai__ai-provider-floating-button',
            100,
            5000,
          ))
      }
      const shortCutsEngine = engine.getShortCutsEngine()
      const shortCutsVariables = shortCutsEngine.getVariables()
      const cloneConfig = cloneDeep(config)
      cloneConfig.variables.map((variable) => {
        if (
          variable.defaultValue &&
          typeof variable.defaultValue === 'string'
        ) {
          variable.defaultValue =
            shortcutsRenderTemplate(variable.defaultValue, shortCutsVariables)
              .data || ''
        }
        return variable
      })
      cloneConfig.template =
        config.template || this.parameters?.compliedTemplate || ''
      const result: ActionSetVariablesConfirmData =
        await OneShotCommunicator.send(
          'SetVariablesModal',
          {
            task: 'open',
            config: cloneConfig,
          },
          5 * 60 * 1000,
        )
      if (result.success) {
        Object.keys(result.data).forEach((VariableName) => {
          if (result.data[VariableName] !== undefined) {
            shortCutsEngine?.setVariable(
              VariableName,
              result.data[VariableName],
              true,
            )
          }
        })
      } else {
        this.error = 'User cancel!'
        shortCutsEngine?.reset()
      }
      this.output = JSON.stringify(result.data)
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
