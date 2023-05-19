import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { IAction } from '@/features/shortcuts/types/Action'
import { IChatMessage } from '@/features/chatgpt/types'

class Action implements IAction {
  id: string
  type: ActionIdentifier
  status: 'notRunning' | 'running' | 'complete'
  error?: string
  output?: any
  parameters: ActionParameters
  autoExecute: boolean
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    this.id = id
    this.type = type
    this.status = 'notRunning'
    this.parameters = Object.assign({}, parameters) || {}
    this.autoExecute = autoExecute
  }

  async execute(params: any, engine: any) {
    this.status = 'running'
    this.error = ''
    this.output = ''
    this.status = 'complete'
  }
  pushMessageToChat(message: Partial<IChatMessage>, engine: any) {
    if (engine && engine.getChartGPT()?.pushMessage) {
      engine
        .getChartGPT()
        ?.pushMessage(message.type as 'third', message.text, 'success')
    }
  }
}
export default Action
