import {
  IShortcutEngineVariableType,
  IShortcutEngine,
  IShortcutEngineListenerEventType,
  IShortcutEngineListenerType,
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
  ActionDate,
  ActionDateFormat,
} from '@/features/shortcuts/actions'
import { v4 } from 'uuid'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { IAction } from '@/features/shortcuts/types/Action'

const ActionClassMap = {
  // 即将废弃
  [ActionGmailInsertReplyBox.type]: ActionGmailInsertReplyBox,
  // chatgpt
  [ActionAskChatGPT.type]: ActionAskChatGPT,
  [ActionRenderChatGPTPrompt.type]: ActionRenderChatGPTPrompt,
  // scripts
  [ActionInsertUserInput.type]: ActionInsertUserInput,
  [ActionSetVariable.type]: ActionSetVariable,
  // web
  [ActionURL.type]: ActionURL,
  [ActionGetContentsOfWebPage.type]: ActionGetContentsOfWebPage,
  [ActionGetContentsOfURL.type]: ActionGetContentsOfURL,
  [ActionGetContentsOfSearchEngine.type]: ActionGetContentsOfSearchEngine,
  //calendar
  [ActionDate.type]: ActionDate,
  [ActionDateFormat.type]: ActionDateFormat,
  // webgpt插件
  [ActionWebGPTSearchResultsExpand.type]: ActionWebGPTSearchResultsExpand,
}

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t))

class ShortCutsEngine implements IShortcutEngine {
  status: IShortcutEngine['status'] = 'idle'
  variables = new Map<string, any>()
  stepIndex = -1
  actions: IShortcutEngine['actions'] = []
  listeners: IShortcutEngine['listeners'] = []
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
  pushActions(
    actions: Array<{
      id?: string
      type: ActionIdentifier
      parameters: ActionParameters
      autoExecute?: boolean
    }>,
    position: 'after' | 'last',
  ) {
    console.log('ShortCutEngine.pushActions', actions)
    const newActions: any[] = []
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
      newActions.push(ActionInstance)
    })
    if (position === 'after') {
      this.actions.splice(this.stepIndex + 1, 0, ...newActions)
    } else {
      this.actions.push(...newActions)
    }
  }
  private async executeAction(action: IAction, engine: any) {
    try {
      console.log('ShortCutEngine.executeAction', action)
      // reset action
      action.error = ''
      action.output = ''
      // execute action
      action.status = 'running'
      this.emit('action', action)
      await action.execute(this.getVariable(), engine)
      if (action.error) {
        action.status = 'error'
        this.emit('action', action)
        return
      }
      action.status = 'complete'
      this.emit('action', action)
    } catch (error) {
      console.log('ShortCutEngine.executeAction error', error)
      action.status = 'error'
      this.emit('action', action)
    }
  }
  async run(params?: any) {
    try {
      const { engine, parameters } = params
      if (this.status === 'idle' || this.status === 'stop') {
        this.status = 'running'
        this.emit('status', this)
        while (this.status === 'running') {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (this.status === 'stop') {
            console.log('ShortCutEngine.run: stop')
            break
          }
          this.stepIndex += 1
          if (this.stepIndex >= this.actions.length) {
            console.log('ShortCutEngine.run: no more actions')
            this.status = 'complete'
            this.emit('status', this)
            this.reset()
            break
          }
          if (parameters) {
            this.setVariables(parameters)
          }
          const currentAction = this.getCurrentAction()
          console.log(
            `ShortCutEngine.run action [${this.stepIndex}] progress: \t`,
            this.progress,
          )
          if (currentAction) {
            this.emit('beforeRunAction', {
              ShortcutsEngine: this,
              action: currentAction,
              progress: this.progress,
            })
            await this.executeAction(currentAction, engine)
            this.emit('afterRunAction', {
              ShortcutsEngine: this,
              action: currentAction,
              progress: this.progress,
            })
            console.log(
              'ShortCutEngine.run: executeAction',
              currentAction,
              currentAction.status,
            )
            if (currentAction.error) {
              console.log('ShortCutEngine.run: error', currentAction.error)
              this.status = 'stop'
              this.emit('status', this)
              this.stepIndex = this.stepIndex - 1
              break
            }
            const output = currentAction.output || ''
            this.setVariable('LAST_ACTION_OUTPUT', output, true)
            console.log('ShortCutEngine.run: output', output)
            const nextAction = this.getNextAction()
            if (nextAction?.autoExecute && !currentAction.error) {
              continue
            }
          }
          await delay(100)
        }
      } else {
        console.log('ShortCutEngine.run: already running')
      }
    } catch (e) {
      console.error(
        `ShortCutEngine.run error in action[${this.stepIndex}] error: \t`,
        e,
      )
      this.status = 'stop'
      this.emit('status', this)
    }
  }

  stop() {
    console.log('ShortCutEngine.stop')
    this.status = 'stop'
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
  get progress() {
    return Number(
      (Math.max(this.stepIndex, 0) / this.actions.length).toFixed(2),
    )
  }
  // 事件监听
  addListener(listener: IShortcutEngineListenerType) {
    this.listeners.push(listener)
  }
  removeListener(listener: IShortcutEngineListenerType) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }
  removeAllListeners() {
    this.listeners = []
  }
  emit(event: IShortcutEngineListenerEventType, data?: any) {
    this.listeners.forEach((listener) => {
      listener(event, data)
    })
  }
}
export default ShortCutsEngine
