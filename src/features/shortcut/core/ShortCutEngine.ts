import {
  IShortcutEngineVariableType,
  IShortcutEngine,
} from '@/features/shortcut'

class ShortCutEngine implements IShortcutEngine {
  status: IShortcutEngine['status'] = 'notRunning'
  variables = new Map<string, any>()
  shortcut: IShortcutEngine['shortcut'] = {
    name: '',
    actions: [],
  }
  stepIndex = 0

  constructor(shortcut: IShortcutEngine['shortcut']) {
    this.shortcut = shortcut
  }

  async run(params: any) {
    this.setVariables(params)
    console.log('ShortCutEngine.run')
    this.status = 'running'
    const stepAction = this.shortcut.actions[this.stepIndex]
    if (stepAction) {
      await stepAction.execute(this.getVariable(), this.setVariable.bind(this))
      this.stepIndex++
    } else {
      console.log('ShortCutEngine.run: no more actions')
    }
    this.status = 'notRunning'
  }

  stop() {
    console.log('ShortCutEngine.stop')
  }

  reset() {
    console.log('ShortCutEngine.reset')
  }
  setVariable(
    key: IShortcutEngineVariableType,
    value: any,
    overwrite: boolean,
  ) {
    console.log('ShortCutEngine.setVariable')
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
    console.log('ShortCutEngine.setVariables')
    variables.forEach((variable) => {
      this.setVariable(variable.key, variable.value, variable.overwrite)
    })
  }
  getVariable(key?: IShortcutEngineVariableType) {
    if (key) {
      return this.variables.get(key)
    }
    return this.variables
  }
}
export { ShortCutEngine }
