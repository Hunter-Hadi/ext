import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getSocialMediaPostContent } from '@/features/shortcuts/utils/socialMedia/getSocialMediaPostContentOrDraft'
export class ActionGetSocialMediaPostContentOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE'
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
      const result = await getSocialMediaPostContent(
        OperationElementElementSelector,
      )
      const shortcutsEngine = engine.getShortCutsEngine()
      if (shortcutsEngine) {
        shortcutsEngine.pushActions(
          [
            {
              type: 'SET_VARIABLE_MAP',
              parameters: {
                VariableMap: {
                  SOCIAL_MEDIA_TARGET_POST_OR_COMMENT:
                    result.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT,
                  SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT:
                    result.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT,
                },
              },
            },
          ],
          'after',
        )
      }
      this.output = result.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
}
