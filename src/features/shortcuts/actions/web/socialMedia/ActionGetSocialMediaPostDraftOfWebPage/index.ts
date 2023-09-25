import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoading,
} from '@/features/shortcuts/decorators'
import { getSocialMediaPostContentOrDraft } from '@/features/shortcuts/utils/socialMedia/getSocialMediaPostContentOrDraft'
export class ActionGetSocialMediaPostDraftOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE'
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
    const OperationElementElementSelector =
      this.parameters.OperationElementElementSelector ||
      params.OperationElementElementSelector ||
      ''
    try {
      const result = await getSocialMediaPostContentOrDraft(
        OperationElementElementSelector,
      )
      this.output = result
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
}
