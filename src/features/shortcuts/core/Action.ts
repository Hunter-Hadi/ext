import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { IAction } from '@/features/shortcuts/types/Action'
import { ISystemChatMessage } from '@/features/chatgpt/types'

class Action implements IAction {
  id: string
  type: ActionIdentifier
  status: 'idle' | 'running' | 'complete'
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
    this.status = 'idle'
    this.parameters = Object.assign({}, parameters) || {}
    this.autoExecute = autoExecute
  }

  async execute(params: any, engine: any) {
    this.status = 'running'
    this.error = ''
    this.output = ''
    this.status = 'complete'
  }
  pushMessageToChat(message: ISystemChatMessage, engine: any) {
    if (engine && engine.getChartGPT()?.pushMessage) {
      const conversationId =
        engine.getChartGPT()?.getSidebarRef()?.currentConversationIdRef
          ?.current || ''
      engine.getChartGPT()?.pushMessage(message, conversationId)
    }
  }
  reset() {
    this.status = 'idle'
    this.error = ''
    this.output = ''
  }
  getNextAction(engine: any) {
    return engine?.getShortCutsEngine()?.getNextAction() as IAction | null
  }
  getPrevAction(engine: any) {
    return engine?.getShortCutsEngine()?.getPrevAction() as IAction | null
  }
}
export default Action
