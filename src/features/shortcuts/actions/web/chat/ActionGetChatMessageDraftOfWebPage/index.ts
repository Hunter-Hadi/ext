import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getChatMessageDraftContent } from '@/features/shortcuts/utils/chat/getChatMessages'

export class ActionGetChatMessageDraftOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  @pushOutputToChat({
    onlyError: true,
  })
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    const OperationElementSelector =
      this.parameters.OperationElementSelector ||
      params.OperationElementSelector ||
      ''
    try {
      const result = await getChatMessageDraftContent(OperationElementSelector)
      this.output = result
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
}
