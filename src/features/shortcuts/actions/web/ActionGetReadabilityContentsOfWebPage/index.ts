import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoading,
} from '@/features/shortcuts'
import { v4 as uuidV4 } from 'uuid'
import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'
import { getIframeOrSpecialHostPageContent } from '@/features/sidebar/utils/pageSummaryHelper'

export class ActionGetReadabilityContentsOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_READABILITY_CONTENTS_OF_WEBPAGE'
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
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const result =
        (await getIframeOrSpecialHostPageContent()) ||
        (await getPageContentWithMozillaReadability())
      this.output = result
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
