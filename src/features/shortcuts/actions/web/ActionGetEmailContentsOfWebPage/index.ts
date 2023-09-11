import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoading,
} from '@/features/shortcuts'
import { v4 as uuidV4 } from 'uuid'
import getEmailWebsitePageContents from '@/features/shortcuts/actions/web/ActionGetEmailContentsOfWebPage/getEmailWebsitePageContents'
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
  @withLoading()
  async execute(params: ActionParameters, engine: any) {
    try {
      this.pushMessageToChat(
        {
          type: 'system',
          text: `Generating summary...`,
          messageId: uuidV4(),
          extra: {
            status: 'info',
          },
        },
        engine,
      )
      const result =
        (await getIframeOrSpecialHostPageContent()) ||
        (await getEmailWebsitePageContents())
      this.output = result
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
