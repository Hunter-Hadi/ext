import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { IAction } from '@/features/shortcuts/types/Action'
import { ISystemChatMessage } from '@/features/chatgpt/types'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { clientChatConversationUpdate } from '@/features/chatgpt/utils/clientChatConversation'
import { IChatConversation } from '@/background/src/chatConversations'

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
  async pushMessageToChat(message: ISystemChatMessage, engine: any) {
    if (engine && engine.getChartGPT()?.pushMessage) {
      const conversationId = this.getCurrentConversationId(engine)
      await engine.getChartGPT()?.pushMessage(message, conversationId)
    }
  }
  async deleteMessageFromChat(count: number, engine: any) {
    if (engine && engine.getChartGPT()?.deleteMessage) {
      const conversationId = this.getCurrentConversationId(engine)
      await engine.getChartGPT()?.deleteMessage(count, conversationId)
    }
  }
  reset() {
    this.status = 'idle'
    this.error = ''
    this.output = ''
  }
  getCurrentConversationId(engine: any) {
    const conversationId =
      engine.getChartGPT()?.getSidebarRef()?.currentConversationIdRef
        ?.current || ''
    return conversationId
  }
  getCurrentSidebarType(engine: any) {
    const currentSidebarType =
      engine.getChartGPT()?.getSidebarRef()?.currentSidebarSettingsRef?.current
        ?.type || 'Chat'
    return currentSidebarType
  }
  getNextAction(engine: any) {
    return engine?.getShortCutsEngine()?.getNextAction() as IAction | null
  }
  getPrevAction(engine: any) {
    return engine?.getShortCutsEngine()?.getPrevAction() as IAction | null
  }
  async getCurrentConversation(engine: any) {
    const conversationId =
      engine.getChartGPT()?.getSidebarRef()?.currentConversationIdRef
        ?.current || ''
    if (conversationId) {
      return await clientGetConversation(conversationId)
    }
    return null
  }
  async updateConversation(
    engine: any,
    updateConversationData: Partial<IChatConversation>,
  ) {
    const conversationId = this.getCurrentConversationId(engine)
    await clientChatConversationUpdate(conversationId, updateConversationData)
  }
}
export default Action
