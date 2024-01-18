import { v4 as uuidV4 } from 'uuid'

import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { parametersParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

export class ActionChatMessage extends Action {
  static type = 'CHAT_MESSAGE'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }

  @parametersParserDecorator()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const messageType = this.parameters.ActionChatMessageType || 'system'
      const operationType =
        this.parameters.ActionChatMessageOperationType || 'add'
      const messageConfig = this.parameters.ActionChatMessageConfig
      const conversationEngine = engine.clientConversationEngine
      const conversationId =
        conversationEngine?.currentConversationIdRef?.current
      if (!messageConfig || !conversationId || !conversationEngine) {
        this.error = 'invalid parameters'
        return
      }
      if (!messageConfig.type) {
        messageConfig.type = messageType
      }
      if (operationType === 'add') {
        if (!messageConfig.messageId) {
          messageConfig.messageId = uuidV4()
        }
        await conversationEngine.pushMessage(
          mergeWithObject([messageConfig]),
          conversationId,
        )
      } else if (operationType === 'update') {
        await conversationEngine.updateMessage(messageConfig, conversationId)
      } else if (operationType === 'delete') {
        await conversationEngine.deleteMessage(1, conversationId)
      }
      this.output = String(messageConfig.messageId)
    } catch (e) {
      this.error = (e as any).message
    }
  }
}
