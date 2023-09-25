import Action from '@/features/shortcuts/core/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoading,
} from '@/features/shortcuts/decorators'
import { getSocialMediaPostContent } from '@/features/shortcuts/utils/socialMedia/getSocialMediaPostContentOrDraft'
import { IActionSetVariablesData } from '@/features/shortcuts/components/ActionSetVariablesModal/types'
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
  @withLoading()
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
        shortcutsEngine.pushActions([
          {
            type: 'SET_VARIABLE_MAP',
            parameters: {
              VariableMap: {
                TARGET_POST_OF_COMMENT: result.targetPostOrComment,
                CONTEXT: result.fullContext,
              },
            },
          },
        ])
        if (shortcutsEngine.getNextAction()?.type === 'SET_VARIABLES_MODAL') {
          const setVariablesModalAction = shortcutsEngine.getNextAction()
          // 动态设置3套prompt
          let dynamicPrompts = ''
          const addFields: IActionSetVariablesData = []
          addFields.push({
            label: 'Post',
            VariableName: 'POST',
            valueType: 'Text',
            defaultValue: result.postText,
          })
          if (result.previousCommentsText) {
            // 回复post的评论的评论
            addFields.push({
              label: 'Previous comments',
              placeholder: 'Enter previous comments',
              VariableName: 'PREVIOUS_COMMENTS',
              valueType: 'Text',
              defaultValue: result.previousCommentsText,
            })
            addFields.push({
              label: 'Comment',
              placeholder: 'Enter comment',
              VariableName: 'COMMENT',
              valueType: 'Text',
              defaultValue: result.replyCommentText,
            })
            dynamicPrompts = `Ignore all previous instructions. You're a highly skilled social media expert, specialized in {{CURRENT_WEBSITE_DOMAIN}}, adept at responding to all types of {{CURRENT_WEBSITE_DOMAIN}} posts and comments in an appropriate manner.

Your task is to write a reply to the following comment on {{CURRENT_WEBSITE_DOMAIN}}, delimited by triple backticks.

Comment:
\`\`\`
{{COMMENT}}
\`\`\`

---

The above comment is the final one in a series of previous comments of a post. 
Here's the post, delimited by <post></post>:
<post>
{{POST}}
</post>

Here are the earlier comments listed in the order they were added, from the very first to the one before the final comment, delimited by <previous_comments></previous_comments>:
<previous_comments>
{{PREVIOUS_COMMENTS}}
</previous_comments>

---

Make the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the comment and the purpose of your reply.

Choose simple words and phrases. Avoid ones that are too hard or confusing.

Do not use hashtags. Write the reply like a real person would.

Output the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.

Now, write a concise reply to the comment above by *writing a better version* of the following points:
{{KEY_POINTS}}`
          } else if (result.replyCommentText) {
            // 回复post的评论
            addFields.push({
              label: 'Comment',
              placeholder: 'Enter comment',
              VariableName: 'COMMENT',
              valueType: 'Text',
              defaultValue: result.replyCommentText,
            })
            dynamicPrompts = `Ignore all previous instructions. You're a highly skilled social media expert, specialized in {{CURRENT_WEBSITE_DOMAIN}}, adept at responding to all types of {{CURRENT_WEBSITE_DOMAIN}} posts and comments in an appropriate manner.

Your task is to write a reply to the following comment on {{CURRENT_WEBSITE_DOMAIN}}, delimited by triple backticks.

Comment:
\`\`\`
{{COMMENT}}
\`\`\`

---

The above comment is a comment of a post. 
Here's the post, delimited by <post></post>:
<post>
{{POST}}
</post>

---

Make the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the comment and the purpose of your reply.

Choose simple words and phrases. Avoid ones that are too hard or confusing.

Do not use hashtags. Write the reply like a real person would.

Output the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.

Now, write a concise reply to the comment above by *writing a better version* of the following points:
{{KEY_POINTS}}`
          } else {
            // 回复post
            dynamicPrompts = `Ignore all previous instructions. You're a highly skilled social media expert, specialized in {{CURRENT_WEBSITE_DOMAIN}}, adept at responding to all types of {{CURRENT_WEBSITE_DOMAIN}} posts and comments in an appropriate manner.

Your task is to write a reply to the following post on {{CURRENT_WEBSITE_DOMAIN}}, delimited by triple backticks.

Post:
\`\`\`
{{POST}}
\`\`\`

Make the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the post and the purpose of your reply.

Choose simple words and phrases. Avoid ones that are too hard or confusing.

Do not use hashtags. Write the reply like a real person would.

Output the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.

Now, write a concise reply to the post above by *writing a better version* of the following points:
{{KEY_POINTS}}`
          }
          if (setVariablesModalAction?.parameters.SetVariablesModalConfig) {
            setVariablesModalAction.parameters.SetVariablesModalConfig.variables = addFields.concat(
              setVariablesModalAction.parameters.SetVariablesModalConfig
                .variables,
            )
            setVariablesModalAction.parameters.SetVariablesModalConfig.template = dynamicPrompts
          }
          this.output = result.postText
          return
        }
      }
      debugger
      this.output = result.postText
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
}
