import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getSocialMediaPostContent } from '@/features/shortcuts/utils/socialMedia/getSocialMediaPostContentOrDraft'
import { getYouTubeSocialMediaPostCommentsContent } from '@/features/shortcuts/utils/socialMedia/platforms/youtube'
import { ISocialMediaPostContextData } from '@/features/shortcuts/utils/socialMedia/SocialMediaPostContext'
import {
  calculateMaxHistoryQuestionResponseTokens,
  sliceTextByTokens,
} from '@/features/shortcuts/utils/tokenizer'
export class ActionGetSocialMediaPostContentOfWebPage extends Action {
  static type: ActionIdentifier = 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE'
  originalSocialMediaPostContent: ISocialMediaPostContextData | null = null
  isStopAction = false
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
    const OperationElementSelector =
      this.parameters.OperationElementSelector ||
      params.OperationElementSelector ||
      ''
    try {
      if (this.isStopAction) return
      let result = await getSocialMediaPostContent(OperationElementSelector)
      if (this.isStopAction) return
      const conversation =
        await engine.clientConversationEngine?.getCurrentConversation()
      if (
        conversation?.type === 'Summary' &&
        params.CURRENT_WEBSITE_DOMAIN === 'www.youtube.com'
      ) {
        //为youtube添加评论prompt数据
        const haveCommentResults =
          await getYouTubeSocialMediaPostCommentsContent(result)
        if (haveCommentResults) {
          result = haveCommentResults
        }
        if (this.isStopAction) return
      }
      console.log('simply result', result)
      this.output = result.SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT
      this.originalSocialMediaPostContent = result
      const { shortcutsEngine, clientConversationEngine } = engine
      if (shortcutsEngine && clientConversationEngine) {
        let SOCIAL_MEDIA_TARGET_POST_OR_COMMENT =
          result.SOCIAL_MEDIA_TARGET_POST_OR_COMMENT
        let SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT =
          result.SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT
        // reply with keyPoints的逻辑
        if (this.isStopAction) return
        const conversation =
          await clientConversationEngine.getCurrentConversation()
        if (this.isStopAction) return

        const AIModelMaxTokens = conversation?.meta?.maxTokens || 4096
        const maxSocialMediaContextTokens =
          AIModelMaxTokens -
          calculateMaxHistoryQuestionResponseTokens(AIModelMaxTokens)
        // 先计算TargetContext的Tokens占用，剩下的再给FullContext
        if (this.isStopAction) return
        const {
          isLimit,
          text: sliceOfTargetPostContext,
          tokens: sliceOfTargetPostContextUsingTokens,
        } = await sliceTextByTokens(
          SOCIAL_MEDIA_TARGET_POST_OR_COMMENT,
          maxSocialMediaContextTokens,
        )
        if (this.isStopAction) return
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT = sliceOfTargetPostContext
        if (isLimit) {
          SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT = ''
        } else {
          if (this.isStopAction) return
          const { text: sliceOfFullPostContext } = await sliceTextByTokens(
            SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT,
            maxSocialMediaContextTokens - sliceOfTargetPostContextUsingTokens,
          )
          if (this.isStopAction) return
          SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT = sliceOfFullPostContext
        }
        shortcutsEngine.pushActions(
          [
            {
              type: 'SET_VARIABLE_MAP',
              parameters: {
                VariableMap: {
                  SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: {
                    key: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                    value: SOCIAL_MEDIA_TARGET_POST_OR_COMMENT,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Target post/comment',
                  },
                  SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT: {
                    key: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                    value: SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Context',
                  },
                  SOCIAL_MEDIA_PAGE_CONTENT: {
                    key: '',
                    value: result.SOCIAL_MEDIA_PAGE_CONTENT,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Post content',
                  },
                  SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS: {
                    key: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS',
                    value: result.previousComments,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Comments',
                  },
                  // TODO 感觉这里和上方有冗余，后续优化
                  SOCIAL_MEDIA_POST_TITLE: {
                    key: 'SOCIAL_MEDIA_POST_TITLE',
                    value: result.post?.title,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Post title',
                  },
                  SOCIAL_MEDIA_POST_AUTHOR: {
                    key: 'SOCIAL_MEDIA_POST_AUTHOR',
                    value: result.post?.author,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Post author',
                  },
                  SOCIAL_MEDIA_POST_DATE: {
                    key: 'SOCIAL_MEDIA_POST_DATE',
                    value: result.post?.date,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Post date',
                  },
                  SOCIAL_MEDIA_POST_CONTENT: {
                    key: 'SOCIAL_MEDIA_POST_CONTENT',
                    value: result.post?.content,
                    overwrite: true,
                    isBuiltIn: true,
                    label: 'Post content',
                  },
                },
              },
            },
            {
              type: 'RENDER_TEMPLATE',
              parameters: {
                template: result.SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT,
              },
            },
          ],
          'after',
        )
      }
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.isStopAction = true
    await stopActionMessageStatus(params)
    return true
  }
}
