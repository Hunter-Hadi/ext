export type IShortcutEngineBuiltInVariableType =
  | 'GMAIL_MESSAGE_CONTEXT'
  | 'GMAIL_DRAFT_CONTEXT'
  | 'INPUT_VALUE'
export type IShortcutEngineVariableType =
  | IShortcutEngineBuiltInVariableType
  | string
// 定义动作接口
export interface IAction {
  name: string
  //动作的类型，比如 "prompt" 或 "openURL"
  type: 'prompt' | 'openURL'
  execute: (
    params: any,
    setVariable: (key: string, value: any, overwrite: boolean) => void,
  ) => Promise<void>
  error?: string
  output?: any
}

// 定义捷径接口
export interface IShortcut {
  name: string
  actions: IAction[]
}

// 定义捷径引擎接口
export interface IShortcutEngine {
  status: 'notRunning' | 'running' | 'stop' | 'complete'
  variables: Map<string, any>
  shortcut: IShortcut
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
}
