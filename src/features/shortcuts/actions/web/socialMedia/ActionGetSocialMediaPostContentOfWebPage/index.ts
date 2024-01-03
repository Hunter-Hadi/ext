import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getSocialMediaPostContent } from '@/features/shortcuts/utils/socialMedia/getSocialMediaPostContentOrDraft'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
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
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    const OperationElementElementSelector =
      this.parameters.OperationElementElementSelector ||
      params.OperationElementElementSelector ||
      ''
    try {
      const result = await getSocialMediaPostContent(
        OperationElementElementSelector,
      )
      if (engine.shortcutsEngine) {
        engine.shortcutsEngine.pushActions(
      const shortcutsEngine = engine.getShortCutsEngine()
      let SOCIAL_MEDIA_TARGET_POST_OR_COMMENT =
        result.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT
      let SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT =
        result.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT
      // reply with keyPoints的逻辑
      const conversation = await this.getCurrentConversation(engine)
      // 预留1000个token给summary
      const totalTokens = Math.max(
        (conversation?.meta?.maxTokens || 4000) - 1000,
        3000,
      )
      // 先计算TargetContext的Tokens占用，剩下的再给FullContext
      const {
        isLimit,
        text: sliceOfTargetPostContext,
        tokens: sliceOfTargetPostContextUsingTokens,
      } = await sliceTextByTokens(
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT,
        totalTokens,
      )
      SOCIAL_MEDIA_TARGET_POST_OR_COMMENT = sliceOfTargetPostContext
      if (isLimit) {
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT = ''
      } else {
        const { text: sliceOfFullPostContext } = await sliceTextByTokens(
          SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT,
          totalTokens - sliceOfTargetPostContextUsingTokens,
        )
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT = sliceOfFullPostContext
      }
      if (shortcutsEngine) {
        shortcutsEngine.pushActions(
          [
            {
              type: 'SET_VARIABLE_MAP',
              parameters: {
                VariableMap: {
                  SOCIAL_MEDIA_TARGET_POST_OR_COMMENT,
                  SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT,
                  SOCIAL_MEDIA_PAGE_CONTENT: result.SOCIAL_MEDIA_PAGE_CONTENT,
                },
              },
            },
            {
              type: 'RENDER_TEMPLATE',
              parameters: {
                template: result.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT,
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
