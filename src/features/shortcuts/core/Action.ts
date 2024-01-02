import { IChatConversation } from '@/background/src/chatConversations'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { IChatMessage } from '@/features/chatgpt/types'
import { clientChatConversationUpdate } from '@/features/chatgpt/utils/clientChatConversation'
import {
  IShortcutEngineExternalEngine,
  shortcutsRenderTemplate,
} from '@/features/shortcuts'
import { IAction } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import Log from '@/utils/Log'

class Action implements IAction {
  id: string
  type: ActionIdentifier
  status: 'idle' | 'running' | 'complete'
  error?: string
  output?: any
  parameters: ActionParameters
  autoExecute: boolean
  log: Log
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
    this.log = new Log(`Action/${type}`)
  }

  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    this.status = 'running'
    this.error = ''
    this.output = ''
    this.status = 'complete'
  }
  async pushMessageToChat(message: IChatMessage, engine: any) {
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
  async parseTemplate(template: string, params: ActionParameters) {
    return shortcutsRenderTemplate(template, params)
  }
  async stop() {
    this.reset()
    return false
  }
  reset() {
    this.status = 'idle'
    this.error = ''
    this.output = ''
  }
}
export default Action
