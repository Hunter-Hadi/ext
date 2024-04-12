import { v4 } from 'uuid'

import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import {
  ActionAnalyzeChatFile,
  ActionAskChatGPT,
  ActionAssignCustomPromptWebPageContentContextVariable,
  ActionChatMessage,
  ActionCloseURLS,
  ActionConditional,
  ActionCreateWebsiteContext,
  ActionDate,
  ActionDateFormat,
  ActionFetchActions,
  ActionGetChatMessageDraftOfWebPage,
  ActionGetChatMessagesContentOfWebPage,
  ActionGetContentsOfSearchEngine,
  ActionGetContentsOfURL,
  ActionGetContentsOfWebPage,
  ActionGetEmailContentsOfWebPage,
  ActionGetEmailDraftOfWebPage,
  ActionGetPDFContentsOfCRX,
  ActionGetReadabilityContentsOfWebPage,
  ActionGetSocialMediaPostContentOfWebPage,
  ActionGetSocialMediaPostDraftOfWebPage,
  ActionGetYoutubeTranscriptOfURL,
  ActionInsertUserInput,
  ActionMaxAIProcessBuiltInParameters,
  ActionOpenURLs,
  ActionOperationElement,
  ActionRenderChatGPTPrompt,
  ActionRenderTemplate,
  ActionSetVariable,
  ActionSetVariableMap,
  ActionSetVariablesModal,
  ActionSliceOfText,
  ActionsMaxAISummaryLog,
  ActionSummarizeOfText,
  ActionTextHandler,
  ActionUploadPDFOfCRX,
  ActionURL,
  ActionWebGPTSearchResultsExpand,
} from '@/features/shortcuts/actions'
import { ActionGetYoutubeSocialMediaComments } from '@/features/shortcuts/actions/web/socialMedia/ActionGetYoutubeSocialMediaSummaryInfo/ActionGetYoutubeSocialMediaComments'
import { ActionGetYoutubeSocialMediaTranscripts } from '@/features/shortcuts/actions/web/socialMedia/ActionGetYoutubeSocialMediaSummaryInfo/ActionGetYoutubeSocialMediaTranscripts'
import { ActionGetYoutubeSocialMediaTranscriptTimestamped } from '@/features/shortcuts/actions/web/socialMedia/ActionGetYoutubeSocialMediaSummaryInfo/ActionGetYoutubeSocialMediaTranscriptTimestamped'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import {
  IShortcutEngine,
  IShortcutEngineListenerEventType,
  IShortcutEngineListenerType,
  IShortcutEngineVariableType,
} from '@/features/shortcuts/types'
import { IAction } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

const ActionClassMap = {
  // 废弃
  [ActionRenderChatGPTPrompt.type]: ActionRenderChatGPTPrompt,
  //common
  [ActionRenderTemplate.type]: ActionRenderTemplate,
  //youtube summary
  [ActionGetYoutubeSocialMediaComments.type]:
    ActionGetYoutubeSocialMediaComments,
  [ActionGetYoutubeSocialMediaTranscripts.type]:
    ActionGetYoutubeSocialMediaTranscripts,
  [ActionGetYoutubeSocialMediaTranscriptTimestamped.type]:
    ActionGetYoutubeSocialMediaTranscriptTimestamped,
  // chat app
  [ActionAskChatGPT.type]: ActionAskChatGPT,
  [ActionAskChatGPT.type]: ActionAskChatGPT,
  [ActionAnalyzeChatFile.type]: ActionAnalyzeChatFile,
  [ActionChatMessage.type]: ActionChatMessage,
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
  [ActionUploadPDFOfCRX.type]: ActionUploadPDFOfCRX,
  [ActionOpenURLs.type]: ActionOpenURLs,
  [ActionCloseURLS.type]: ActionCloseURLS,
  [ActionGetReadabilityContentsOfWebPage.type]:
    ActionGetReadabilityContentsOfWebPage,
  [ActionGetEmailContentsOfWebPage.type]: ActionGetEmailContentsOfWebPage,
  [ActionGetEmailDraftOfWebPage.type]: ActionGetEmailDraftOfWebPage,
  [ActionGetSocialMediaPostDraftOfWebPage.type]:
    ActionGetSocialMediaPostDraftOfWebPage,
  [ActionGetSocialMediaPostContentOfWebPage.type]:
    ActionGetSocialMediaPostContentOfWebPage,
  [ActionGetChatMessagesContentOfWebPage.type]:
    ActionGetChatMessagesContentOfWebPage,
  [ActionGetChatMessageDraftOfWebPage.type]: ActionGetChatMessageDraftOfWebPage,
  [ActionAssignCustomPromptWebPageContentContextVariable.type]:
    ActionAssignCustomPromptWebPageContentContextVariable,
  //calendar
  [ActionDate.type]: ActionDate,
  [ActionDateFormat.type]: ActionDateFormat,
  // documents
  [ActionSummarizeOfText.type]: ActionSummarizeOfText,
  [ActionSliceOfText.type]: ActionSliceOfText,
  [ActionCreateWebsiteContext.type]: ActionCreateWebsiteContext,
  [ActionTextHandler.type]: ActionTextHandler,
  // webgpt插件
  [ActionWebGPTSearchResultsExpand.type]: ActionWebGPTSearchResultsExpand,
  // maxai
  [ActionsMaxAISummaryLog.type]: ActionsMaxAISummaryLog,
  [ActionMaxAIProcessBuiltInParameters.type]:
    ActionMaxAIProcessBuiltInParameters,
}

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t))

class ShortCutsEngine implements IShortcutEngine {
  status: IShortcutEngine['status'] = 'idle'
  variables = new Map<string, IShortCutsParameter>()
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
      await action.execute(this.getVariablesValue(), engine)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (action.status === 'stop') {
        this.emit('action', action)
        return
      }
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
  async run(params?: {
    parameters: IShortCutsParameter[]
    engine: IShortcutEngineExternalEngine
  }) {
    try {
      const { engine, parameters } = params || {}
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
            } else if (currentAction.status === 'stop') {
              console.log('ShortCutEngine.run: stop')
              this.status = 'stop'
              this.emit('status', this)
              break
            }
            const output = currentAction.output || ''
            this.setVariable({
              key: 'LAST_ACTION_OUTPUT',
              value: output,
              overwrite: true,
              isBuiltIn: true,
            })
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

  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.status = 'stop'
    console.log('ShortCutEngine.stop', this.getCurrentAction()?.stop)
    await this.getCurrentAction()?.stop(params)
  }

  reset() {
    console.log('ShortCutEngine.reset')
    this.stepIndex = -1
    this.variables = new Map<string, any>()
    this.status = 'idle'
  }
  setVariable(variable: IShortCutsParameter) {
    // console.log('ShortCutEngine.setVariable', key, value, overwrite)
    if (this.variables.has(variable.key)) {
      if (variable.overwrite) {
        this.variables.set(variable.key, variable)
      } else {
        console.log('ShortCutEngine.setVariable: key already exists')
      }
    } else {
      this.variables.set(variable.key, variable)
    }
  }
  setVariables(variables: IShortCutsParameter[]) {
    console.log('ShortCutEngine.setVariables', variables)
    variables.forEach((variable) => {
      this.setVariable(variable)
    })
  }
  getVariable(key: IShortcutEngineVariableType) {
    return this.variables.get(key as string)
  }
  getVariablesValue() {
    const transformedMap: {
      [key: string]: any
    } = {}
    this.variables.forEach((value, key) => {
      transformedMap[key] = value.value
    })
    console.log('ShortCutEngine.getVariables', transformedMap)
    return transformedMap
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
}
export default ShortCutsEngine
