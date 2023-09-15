import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoading,
} from '@/features/shortcuts/decorators'
import { getIframeOrSpecialHostPageContent } from '@/features/sidebar/utils/pageSummaryHelper'
import { getEmailWebsitePageContentsOrDraft } from '@/features/shortcuts/actions/web/email/getEmailWebsitePageContentsOrDraft'
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
  @withLoading()
  async execute(params: ActionParameters, engine: any) {
    try {
      const result =
        (await getIframeOrSpecialHostPageContent()) ||
        (await getEmailWebsitePageContentsOrDraft())
      this.output = result
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
}
