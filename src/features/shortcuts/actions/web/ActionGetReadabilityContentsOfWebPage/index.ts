import {
  IShortcutEngineExternalEngine,
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts'
import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'
import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
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
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const result =
        (await getIframeOrSpecialHostPageContent()) ||
        (await getPageContentWithMozillaReadability())
      if (result.length < 100 && typeof document !== 'undefined') {
        this.output = document.body.innerText
      } else {
        this.output = result
      }
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
