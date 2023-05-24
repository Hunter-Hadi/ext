import {
  IShortcutEngineVariableType,
  IShortcutEngine,
} from '@/features/shortcuts/types'
import {
  ActionAskChatGPT,
  ActionRenderChatGPTPrompt,
  ActionGmailInsertReplyBox,
  ActionInsertUserInput,
  ActionGetContentsOfWebPage,
  ActionSetVariable,
  ActionURL,
  ActionGetContentsOfURL,
  ActionGetContentsOfSearchEngine,
  ActionWebGPTSearchResultsExpand,
} from '@/features/shortcuts/actions'
import { v4 } from 'uuid'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

const ActionClassMap = {
  [ActionAskChatGPT.type]: ActionAskChatGPT,
  [ActionRenderChatGPTPrompt.type]: ActionRenderChatGPTPrompt,
  [ActionGmailInsertReplyBox.type]: ActionGmailInsertReplyBox,
  [ActionInsertUserInput.type]: ActionInsertUserInput,
  [ActionGetContentsOfWebPage.type]: ActionGetContentsOfWebPage,
  [ActionSetVariable.type]: ActionSetVariable,
  [ActionURL.type]: ActionURL,
  [ActionGetContentsOfURL.type]: ActionGetContentsOfURL,
  [ActionGetContentsOfSearchEngine.type]: ActionGetContentsOfSearchEngine,
  // webgpt
  [ActionWebGPTSearchResultsExpand.type]: ActionWebGPTSearchResultsExpand,
}

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t))

class ShortCutsEngine implements IShortcutEngine {
  status: IShortcutEngine['status'] = 'idle'
  variables = new Map<string, any>()
  stepIndex = -1
  actions: IShortcutEngine['actions'] = []
  constructor() {
    console.log('ShortCutEngine.constructor')
  }

  setActions(
    actions: Array<{
      id?: string
      type: ActionIdentifier
      parameters: ActionParameters
      autoExecute?: boolean
    }>,
  ) {
    this.reset()
    console.log('ShortCutEngine.setActions', actions)
    this.actions = []
    actions.map((action) => {
      const CurrentActionClass = ActionClassMap[action.type]
      if (!CurrentActionClass) {
        throw new Error(`Action type ${action.type} not found`)
      }
      const ActionInstance = new CurrentActionClass(
        action.id || v4(),
        action.type,
        action.parameters || {},
        typeof action.autoExecute === 'boolean' ? action.autoExecute : true,
      )
      this.actions.push(ActionInstance)
    })
  }
  async run(params?: any) {
    try {
      const { engine, parameters } = params
      this.stepIndex += 1
      if (this.status === 'idle' || this.status === 'running') {
        const currentAction = this.getCurrentAction()
        if (currentAction) {
          this.status = 'running'
          if (parameters) {
            this.setVariables(parameters)
          }
          console.log(
            `ShortCutEngine.run action[${this.stepIndex}]`,
            engine,
            this.getVariable(),
            currentAction.type,
            currentAction.parameters,
          )
          await currentAction.execute(this.getVariable(), engine)
          if (currentAction.error) {
            this.stepIndex = Math.max(this.stepIndex - 1, -1)
            return
          }
          const output = currentAction.output || ''
          this.setVariable('LAST_ACTION_OUTPUT', output, true)
          console.log('ShortCutEngine.run: output', output)
          const nextAction = this.getNextAction()
          if (nextAction?.autoExecute && !currentAction.error) {
            console.log('ShortCutEngine.run: auto run next')
            // HACK: 出问题再说
            await delay(0)
            await this.run(params)
          }
          if (currentAction.error) {
            this.reset()
            return
          }
        } else {
          console.log('ShortCutEngine.run: no more actions')
          this.stepIndex = -1
        }
      } else {
        console.log('ShortCutEngine.run: already running')
      }
    } catch (e) {
      console.error(
        `ShortCutEngine.run error in action[${this.stepIndex}] error: \t`,
        e,
      )
      this.reset()
    } finally {
      this.status = 'idle'
    }
  }

  stop() {
    console.log('ShortCutEngine.stop')
  }

  reset() {
    console.log('ShortCutEngine.reset')
    this.stepIndex = -1
    this.variables = new Map<string, any>()
    this.status = 'idle'
  }
  setVariable(
    key: IShortcutEngineVariableType,
    value: any,
    overwrite: boolean,
  ) {
    // console.log('ShortCutEngine.setVariable', key, value, overwrite)
    if (this.variables.has(key as string)) {
      if (overwrite) {
        this.variables.set(key as string, value)
      } else {
        console.log('ShortCutEngine.setVariable: key already exists')
      }
    } else {
      this.variables.set(key as string, value)
    }
  }
  setVariables(
    variables: Array<{
      key: IShortcutEngineVariableType
      value: any
      overwrite: boolean
    }>,
  ) {
    console.log('ShortCutEngine.setVariables', variables)
    variables.forEach((variable) => {
      this.setVariable(variable.key, variable.value, variable.overwrite)
    })
  }
  getVariable(key?: IShortcutEngineVariableType) {
    if (key) {
      return this.variables.get(key as string)
    }
    console.log(
      'ShortCutEngine.getVariables',
      Object.fromEntries(this.variables),
    )
    return Object.fromEntries(this.variables)
  }
  getCurrentAction() {
    return this.actions[this.stepIndex]
  }
  getNextAction() {
    return this.actions[this.stepIndex + 1] || null
  }
}
export default ShortCutsEngine
