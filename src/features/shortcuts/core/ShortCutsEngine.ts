import {
  IShortcutEngineVariableType,
  IShortcutEngine,
  IAction,
} from '@/features/shortcuts'
import { PromptAction } from '@/features/shortcuts/actions'

const actionClasses = [PromptAction]

class ShortCutsEngine implements IShortcutEngine {
  status: IShortcutEngine['status'] = 'notRunning'
  variables = new Map<string, any>()
  stepIndex = 0
  actions: IShortcutEngine['actions'] = []
  constructor() {
    console.log('ShortCutEngine.constructor')
  }

  setActions(
    actions: Array<{
      id: string
      type: IAction['type']
      parameters: any
      autoNext?: boolean
    }>,
  ) {
    this.actions = []
    actions.map((action) => {
      const CurrentActionClass = actionClasses.find(
        (ActionClass) => ActionClass.type === action.type,
      )
      if (!CurrentActionClass) {
        throw new Error(`Action type ${action.type} not found`)
      }
      const ActionInstance = new CurrentActionClass(
        action.id,
        action.type,
        action.parameters,
        action.autoNext,
      )
      this.actions.push(ActionInstance)
    })
  }
  async run(params?: any) {
    console.log('ShortCutEngine.run')
    if (this.status === 'notRunning' || this.status === 'running') {
      if (params) {
        this.setVariables(params)
      }
      this.status = 'running'
      const stepActionInstance = this.actions[this.stepIndex]
      if (stepActionInstance) {
        await stepActionInstance.execute(this.getVariable())
        const output = stepActionInstance.output || ''
        if (output) {
          this.setVariable('LAST_ACTION_OUTPUT', output, true)
        }
        console.log('ShortCutEngine.run: output', output)
        this.stepIndex++
      } else {
        console.log('ShortCutEngine.run: no more actions')
        this.stepIndex = 0
      }
      this.status = 'notRunning'
    } else {
      console.log('ShortCutEngine.run: already running')
    }
  }

  stop() {
    console.log('ShortCutEngine.stop')
  }

  reset() {
    console.log('ShortCutEngine.reset')
    this.stepIndex = 0
    this.variables = new Map<string, any>()
  }
  setVariable(
    key: IShortcutEngineVariableType,
    value: any,
    overwrite: boolean,
  ) {
    // console.log('ShortCutEngine.setVariable', key, value, overwrite)
    if (this.variables.has(key)) {
      if (overwrite) {
        this.variables.set(key, value)
      } else {
        console.log('ShortCutEngine.setVariable: key already exists')
      }
    } else {
      this.variables.set(key, value)
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
      return this.variables.get(key)
    }
    console.log(
      'ShortCutEngine.getVariables',
      Object.fromEntries(this.variables),
    )
    return Object.fromEntries(this.variables)
  }
  getCurrentAction() {
    return this.actions[Math.max(this.stepIndex - 1, 0)]
  }
}
export { ShortCutsEngine }
