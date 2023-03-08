export type IShortcutEngineBuiltInVariableType =
  // gmail
  | 'GMAIL_MESSAGE_CONTEXT'
  | 'GMAIL_DRAFT_CONTEXT'
  // system
  | 'LAST_ACTION_OUTPUT'
  | 'USER_INPUT'
  | 'HIGHLIGHTED_TEXT'
  | 'HIGHLIGHTED_HTML'
export type IShortcutEngineVariableType =
  | IShortcutEngineBuiltInVariableType
  | string

export type IActionType =
  | 'RENDER_CHATGPT_PROMPT'
  | 'ASK_CHATGPT'
  | 'GMAIL_INSERT_REPLY_BOX'
export type ISetActionsType = Array<{
  id?: string
  type: IActionType
  parameters: any
  autoExecute?: boolean
}>
// 定义动作接口
export interface IAction {
  id: string
  //动作的类型，比如 "RENDER_CHATGPT_PROMPT" 或 "ASK_CHATGPT"
  type: IActionType
  execute: (params: any, engine: any) => Promise<any>
  error?: string
  output?: any
  parameters?: {
    [key: string]: any
  }
  autoExecute: boolean
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
  setActions: (actions: ISetActionsType) => void
  getCurrentAction: () => IAction
  getNextAction: () => IAction
}
