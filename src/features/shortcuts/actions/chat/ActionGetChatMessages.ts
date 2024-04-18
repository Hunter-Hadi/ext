import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import {
  IShortcutEngineExternalEngine,
  parametersParserDecorator,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * 获取当前会话的消息
 * @description - 获取当前会话的消息
 * @return messages:IChatMessage[] - 返回当前会话的消息
 */
export class ActionGetChatMessages extends Action {
  static type: ActionIdentifier = 'MAXAI_GET_CHAT_MESSAGES'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @parametersParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const messageType = this.parameters.ActionChatMessageType
      const { clientConversationEngine } = engine
      const conversation =
        await clientConversationEngine?.getCurrentConversation()
      if (conversation?.messages) {
        this.output = messageType
          ? conversation.messages.filter(
              (message) => isAIMessage(message) && message.type === messageType,
            )
          : conversation.messages
      } else {
        this.output = []
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
