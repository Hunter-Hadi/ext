import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getEmailWebsitePageDraft } from '@/features/shortcuts/utils/email/getEmailWebsitePageContentsOrDraft'
export class ActionGetEmailDraftOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_EMAIL_DRAFT_OF_WEBPAGE'
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
    try {
      const OperationElementSelector =
        this.parameters.OperationElementSelector ||
        params.OperationElementSelector ||
        ''
      if (OperationElementSelector) {
        const result = await getEmailWebsitePageDraft(OperationElementSelector)
        this.output = result
      } else {
        this.output = ''
      }
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
}
