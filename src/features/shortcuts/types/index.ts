export type IShortcutEngineBuiltInVariableType =
  // gmail
  | 'GMAIL_MESSAGE_CONTEXT'
  | 'GMAIL_DRAFT_CONTEXT'
  // system
  | 'LAST_ACTION_OUTPUT'
  | 'LAST_CHAT_GPT_ANSWER'
  | 'INPUT_VALUE'
export type IShortcutEngineVariableType =
  | IShortcutEngineBuiltInVariableType
  | string

// 定义动作接口
export interface IAction {
  id: string
  //动作的类型，比如 "prompt" 或 "openURL"
  type: 'prompt' | 'openURL'
  execute: (params: any) => Promise<any>
  error?: string
  output?: any
  parameters?: {
    [key: string]: any
  }
  autoNext: boolean
}

// 定义捷径引擎接口
export interface IShortcutEngine {
  status: 'notRunning' | 'running' | 'stop' | 'complete'
  actions: IAction[]
  variables: Map<string, any>
  run: (params: any) => Promise<void>
  stop: () => void
  reset: () => void
  stepIndex: number
  setVariable: (
    key: IShortcutEngineVariableType,
    value: any,
    overwrite: boolean,
  ) => void
  setVariables: (
    variables: Array<{
      key: IShortcutEngineVariableType
      value: any
      overwrite: boolean
    }>,
  ) => void
  getVariable: (key?: IShortcutEngineVariableType) => any
  setActions: (
    actions: Array<{
      id: string
      type: IAction['type']
      parameters: any
    }>,
  ) => void
  getCurrentAction: () => IAction
}
