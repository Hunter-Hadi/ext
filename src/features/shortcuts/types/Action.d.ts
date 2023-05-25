import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export type ISetActionsType = Array<{
  id?: string
  type: ActionIdentifier
  parameters: ActionParameters
  autoExecute?: boolean
}>

// 定义动作接口
export interface IAction {
  id: string
  status: 'idle' | 'running' | 'error' | 'complete'
  //动作的类型，比如 "RENDER_CHATGPT_PROMPT" 或 "ASK_CHATGPT"
  type: ActionIdentifier
  execute: (params: any, engine: any) => Promise<any>
  error?: string
  output?: any
  parameters: ActionParameters
  autoExecute: boolean
}
