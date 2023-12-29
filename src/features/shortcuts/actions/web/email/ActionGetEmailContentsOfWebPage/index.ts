import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getEmailWebsitePageContentsOrDraft } from '@/features/shortcuts/utils/email/getEmailWebsitePageContentsOrDraft'
import { getIframeOrSpecialHostPageContent } from '@/features/sidebar/utils/pageSummaryHelper'
export class ActionGetEmailContentsOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_EMAIL_CONTENTS_OF_WEBPAGE'
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
  async execute(params: ActionParameters, engine: any) {
    const OperationElementElementSelector =
      this.parameters.OperationElementElementSelector ||
      params.OperationElementElementSelector ||
      ''
    try {
      const result =
        (await getIframeOrSpecialHostPageContent()) ||
        (await getEmailWebsitePageContentsOrDraft(
          OperationElementElementSelector,
        ))
      this.output = result
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
}
