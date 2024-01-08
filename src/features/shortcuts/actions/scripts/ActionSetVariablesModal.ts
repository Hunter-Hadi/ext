import cloneDeep from 'lodash-es/cloneDeep'

import { getMaxAISidebarRootElement } from '@/features/common/utils'
import { intervalFindHtmlElement } from '@/features/contextMenu/utils/runEmbedShortCuts'
import {
  shortcutsRenderTemplate,
  templateParserDecorator,
} from '@/features/shortcuts'
import {
  ActionSetVariablesConfirmData,
  ActionSetVariablesModalConfig,
} from '@/features/shortcuts/components/ActionSetVariablesModal'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { showChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
// import { pushOutputToChat } from '@/features/shortcuts/decorators'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

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
      // 是否需要用户输入内容，如果需要的话，那就需要打开sidebar
      let needUserInput = false
      const shortCutsEngine = engine.getShortCutsEngine()
      const shortCutsVariables = shortCutsEngine.getVariables()
      const cloneConfig = cloneDeep(config) as ActionSetVariablesModalConfig
      cloneConfig.variables.map((variable) => {
        if (
          variable.defaultValue &&
          typeof variable.defaultValue === 'string'
        ) {
          variable.defaultValue =
            shortcutsRenderTemplate(variable.defaultValue, shortCutsVariables)
              .data || ''
        }
        if (
          variable.valueType === 'Text' &&
          !variable.defaultValue &&
          !variable.hidden
        ) {
          needUserInput = true
        }
        return variable
      })
      if (cloneConfig.answerInsertMessageId) {
        cloneConfig.answerInsertMessageId =
          shortcutsRenderTemplate(
            cloneConfig.answerInsertMessageId,
            shortCutsVariables,
          ).data || cloneConfig.answerInsertMessageId
      }
      cloneConfig.systemVariables.map((variable) => {
        if (
          variable.defaultValue &&
          typeof variable.defaultValue === 'string'
        ) {
          variable.defaultValue =
            shortcutsRenderTemplate(variable.defaultValue, shortCutsVariables)
              .data || ''
        }
        if (
          variable.valueType === 'Text' &&
          !variable.defaultValue &&
          !variable.hidden
        ) {
          needUserInput = true
        }
        return variable
      })
      if (config.modelKey === 'Sidebar' && needUserInput) {
        showChatBox()
        const root = getMaxAISidebarRootElement()
        root &&
          (await intervalFindHtmlElement(
            root,
            '#max-ai__ai-provider-floating-button',
            100,
            5000,
          ))
      }
      cloneConfig.template =
        config.template || this.parameters?.compliedTemplate || ''
      const result: ActionSetVariablesConfirmData = await OneShotCommunicator.send(
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
