import { IAction, IActionType } from '../types'

class Action implements IAction {
  id: string
  type: IActionType
  status: 'notRunning' | 'running' | 'complete'
  error?: string
  output?: any
  parameters?: {
    compliedTemplate?: string
    [key: string]: any
  }
  autoExecute: boolean
  constructor(
    id: string,
    type: IActionType,
    parameters: any,
    autoExecute: boolean,
  ) {
    this.id = id
    this.type = type
    this.status = 'notRunning'
    this.parameters = parameters || {}
    this.autoExecute = autoExecute
  }

  async execute(params: any, engine: any) {
    this.status = 'running'
    this.error = ''
    this.output = ''
    this.status = 'complete'
  }
}
export { Action }
