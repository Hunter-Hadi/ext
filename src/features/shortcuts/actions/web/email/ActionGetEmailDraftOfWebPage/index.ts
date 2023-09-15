import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoading,
} from '@/features/shortcuts/decorators'
import { getEmailWebsitePageDraft } from '@/features/shortcuts/actions/web/email/getEmailWebsitePageContentsOrDraft'
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
  @withLoading()
  async execute(params: ActionParameters, engine: any) {
    try {
      const OperationElementElementSelector =
        this.parameters.OperationElementElementSelector ||
        params.OperationElementElementSelector ||
        ''
      if (OperationElementElementSelector) {
        const result = await getEmailWebsitePageDraft(
          OperationElementElementSelector,
        )
        this.output = result
      } else {
        this.output = ''
      }
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
}
