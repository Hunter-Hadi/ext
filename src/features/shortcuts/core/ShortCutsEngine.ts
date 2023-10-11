import {
  IShortcutEngineVariableType,
  IShortcutEngine,
  IShortcutEngineListenerEventType,
  IShortcutEngineListenerType,
} from '@/features/shortcuts/types'
import {
  ActionAskChatGPT,
  ActionRenderChatGPTPrompt,
  ActionInsertUserInput,
  ActionGetContentsOfWebPage,
  ActionSetVariable,
  ActionURL,
  ActionGetContentsOfURL,
  ActionGetContentsOfSearchEngine,
  ActionWebGPTSearchResultsExpand,
  ActionDate,
  ActionDateFormat,
  ActionSummarizeOfText,
  ActionWebGPTAskChatGPT,
  ActionSliceOfText,
  ActionFetchActions,
  ActionGetYoutubeTranscriptOfURL,
  ActionGetPDFContentsOfCRX,
  ActionOpenURLs,
  ActionOperationElement,
  ActionCloseURLS,
  ActionConditional,
  ActionAnalyzeChatFile,
  ActionGetEmailContentsOfWebPage,
  ActionGetReadabilityContentsOfWebPage,
  ActionRenderTemplate,
  ActionSetVariableMap,
  ActionSetVariablesModal,
  ActionGetEmailDraftOfWebPage,
  ActionGetSocialMediaPostDraftOfWebPage,
  ActionGetSocialMediaPostContentOfWebPage,
  ActionCreateWebsiteContext,
} from '@/features/shortcuts/actions'
import { v4 } from 'uuid'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { IAction } from '@/features/shortcuts/types/Action'
import { shortcutsRenderTemplate } from '@/features/shortcuts'

const ActionClassMap = {
  // 废弃
  [ActionRenderChatGPTPrompt.type]: ActionRenderChatGPTPrompt,
  //common
  [ActionRenderTemplate.type]: ActionRenderTemplate,
  // chat
  [ActionAskChatGPT.type]: ActionAskChatGPT,
  [ActionAnalyzeChatFile.type]: ActionAnalyzeChatFile,
  // scripts
  [ActionInsertUserInput.type]: ActionInsertUserInput,
  [ActionSetVariable.type]: ActionSetVariable,
  [ActionOperationElement.type]: ActionOperationElement,
  [ActionConditional.type]: ActionConditional,
  [ActionSetVariablesModal.type]: ActionSetVariablesModal,
  [ActionSetVariableMap.type]: ActionSetVariableMap,
  // web
  [ActionURL.type]: ActionURL,
  [ActionGetContentsOfWebPage.type]: ActionGetContentsOfWebPage,
  [ActionGetContentsOfURL.type]: ActionGetContentsOfURL,
  [ActionGetContentsOfSearchEngine.type]: ActionGetContentsOfSearchEngine,
  [ActionFetchActions.type]: ActionFetchActions,
  [ActionGetYoutubeTranscriptOfURL.type]: ActionGetYoutubeTranscriptOfURL,
  [ActionGetPDFContentsOfCRX.type]: ActionGetPDFContentsOfCRX,
  [ActionOpenURLs.type]: ActionOpenURLs,
  [ActionCloseURLS.type]: ActionCloseURLS,
  [ActionGetReadabilityContentsOfWebPage.type]: ActionGetReadabilityContentsOfWebPage,
  [ActionGetEmailContentsOfWebPage.type]: ActionGetEmailContentsOfWebPage,
  [ActionGetEmailDraftOfWebPage.type]: ActionGetEmailDraftOfWebPage,
  [ActionGetSocialMediaPostDraftOfWebPage.type]: ActionGetSocialMediaPostDraftOfWebPage,
  [ActionGetSocialMediaPostContentOfWebPage.type]: ActionGetSocialMediaPostContentOfWebPage,
  //calendar
  [ActionDate.type]: ActionDate,
  [ActionDateFormat.type]: ActionDateFormat,
  // documents
  [ActionSummarizeOfText.type]: ActionSummarizeOfText,
  [ActionSliceOfText.type]: ActionSliceOfText,
  [ActionCreateWebsiteContext.type]: ActionCreateWebsiteContext,
  // webgpt插件
  [ActionWebGPTSearchResultsExpand.type]: ActionWebGPTSearchResultsExpand,
  [ActionWebGPTAskChatGPT.type]: ActionWebGPTAskChatGPT,
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
      action.reset()
      // execute action
      action.status = 'running'
      this.emit('action', action)
      await action.execute(this.getVariables(), engine)
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
          if (parameters && this.stepIndex === 0) {
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
  getVariable(key: IShortcutEngineVariableType) {
    return this.variables.get(key as string)
  }
  getVariables() {
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
  getPrevAction() {
    return this.actions[this.stepIndex - 1] || null
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
  parseTemplate(template: string) {
    return shortcutsRenderTemplate(template, this.getVariables()).data
  }
}
export default ShortCutsEngine
