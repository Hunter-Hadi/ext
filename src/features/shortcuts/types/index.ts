import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { IClientConversationEngine } from '@/features/chatgpt/hooks/useClientConversation'
import { IAction, ISetActionsType } from '@/features/shortcuts/types/Action'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export const SHORTCUT_ENGINE_BUILD_IN_VARIABLES = [
  // gmail
  'GMAIL_EMAIL_CONTEXT',
  'GMAIL_DRAFT_CONTEXT',
  // system
  'LAST_ACTION_OUTPUT',
  'LAST_AI_OUTPUT',
  'USER_INPUT',
  'SELECTED_TEXT',
  'SELECTED_HTML',
  'POPUP_DRAFT',
  'CURRENT_WEBSITE_DOMAIN',
  'CURRENT_WEBPAGE_URL',
  'CURRENT_WEBPAGE_TITLE',
  // settings
  'AI_OUTPUT_LANGUAGE',
  'AI_RESPONSE_LANGUAGE',
] as const
export type IShortcutEngineBuiltInVariableType = typeof SHORTCUT_ENGINE_BUILD_IN_VARIABLES[number]
// OPTIMIZE: 这里的类型应该是ActionParameters，但是ActionParameters的类型太复杂了，所以先用any
export type IShortcutEngineVariableType =
  | IShortcutEngineBuiltInVariableType
  | ActionParameters
  | string

// TODO
// https://github.com/sebj/iOS-Shortcuts-Reference
export interface IShortCut {
  // 代表用于创建工作流的客户端应用程序版本的数字（例如 700）。
  clientVersion?: string
  // 一个可选的整数，表示运行工作流所需的最低客户端应用程序版本（例如 411）
  clientRelease?: string
  importQuestions: Array<{
    // 一个整数，表示快捷方式中操作的索引（WFWorkflowActions数组索引）
    actionIndex: number
    // 一个字符串，通常Parameter
    category: string
    // 默认值
    defaultValue: string
    // 在给定的动作字典中用用户的答案填充的字典键
    parameterKey: string
    // 为了填充操作的参数值而呈现给用户的问题/提示
    text: string
  }>
  icon: {
    // 一个字符串，表示图标的颜色
    color: string
    // 一个字符串，表示图标的图片
    imageData: string
    // 一个号码
    glyphNumber: number
  }
  // 接受的输入类型
  // article|date|email|image|location|pdf|richText|webPage|string|url
  inputContentItemClasses: string[]
  actions: IAction[]
}

export type IShortcutEngineListenerEventType =
  | 'action'
  | 'beforeRunAction'
  | 'afterRunAction'
  | 'status'

export type IShortcutEngineListenerType = (
  event: IShortcutEngineListenerEventType,
  data: any,
) => void

export interface IShortcutEngineExternalEngine {
  // background通信的Engine
  shortcutsMessageChannelEngine?: ContentScriptConnectionV2
  // background通信的Engine
  clientMessageChannelEngine?: ContentScriptConnectionV2
  // shortcuts的Engine
  shortcutsEngine?: IShortcutEngine
  // conversationEngine
  clientConversationEngine?: IClientConversationEngine
}

// 定义捷径引擎接口
export interface IShortcutEngine {
  // 基础
  status: 'idle' | 'running' | 'stop' | 'complete'
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
  getVariable: (key: IShortcutEngineVariableType) => any
  getVariables: () => Record<string, any>
  setActions: (actions: ISetActionsType) => void
  pushActions: (actions: ISetActionsType, position: 'after' | 'last') => void
  getCurrentAction: () => IAction
  getNextAction: () => IAction
  progress: number
  // 事件监听
  listeners: IShortcutEngineListenerType[]
  emit: (event: IShortcutEngineListenerEventType, data: any) => void
  addListener: (listener: IShortcutEngineListenerType) => void
  removeListener: (listener: IShortcutEngineListenerType) => void
  removeAllListeners: () => void
}
