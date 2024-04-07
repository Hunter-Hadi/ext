import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import {
  IShortcutEngineExternalEngine,
  parametersParserDecorator,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

export class ActionGetLastAIMessageId extends Action {
  static type: ActionIdentifier = 'GET_LAST_AI_MESSAGE_ID'
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
      const { clientConversationEngine } = engine
      const conversation =
        await clientConversationEngine?.getCurrentConversation()
      if (conversation) {
        const history = conversation.messages
        let lastAIMessageId = ''
        for (let i = history.length - 1; i >= 0; i--) {
          const message = history[i]
          if (isAIMessage(message)) {
            lastAIMessageId = message.messageId
            this.log.info('Found last AI message', lastAIMessageId, message)
            break
          }
        }
        this.output = lastAIMessageId
      } else {
        this.output = ''
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
