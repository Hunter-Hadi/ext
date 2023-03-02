// 定义动作接口
export interface IAction {
  name: string
  //动作的类型，比如 "prompt" 或 "openURL"
  type: 'prompt' | 'openURL'
  execute: (params: any) => void
  error?: string
  output?: any
  status: 'notRunning' | 'running' | 'complete'
}

// 定义捷径接口
export interface IShortcut {
  name: string
  actions: { [key: string]: any }[]
}

// 定义捷径引擎接口
export interface IShortcutEngine {
  actions: IAction[]
  execute: (shortcut: IShortcut) => void
}
