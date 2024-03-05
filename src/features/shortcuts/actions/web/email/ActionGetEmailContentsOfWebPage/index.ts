import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import {
  pushOutputToChat,
  templateParserDecorator,
  withLoadingDecorators,
} from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getEmailWebsitePageContentsOrDraft } from '@/features/shortcuts/utils/email/getEmailWebsitePageContentsOrDraft'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
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
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    const OperationElementSelector =
      this.parameters.OperationElementSelector ||
      params.OperationElementSelector ||
      ''
    // 是否要对变量进行MiddleOut
    const isVariableMiddleOutEnabled =
      this.parameters.isVariableMiddleOutEnabled === true
    try {
      // 邮件上下文的全文
      let EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT =
        (await getIframeOrSpecialHostPageContent()) || ''
      // 邮件上下文的目标邮件
      let EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT = ''
      if (!EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT) {
        const result = await getEmailWebsitePageContentsOrDraft(
          OperationElementSelector,
        )
        EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT = result.emailContext
        EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT =
          result.targetReplyEmailContext
      }
      this.output = EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT
      const { clientConversationEngine, shortcutsEngine } = engine
      if (clientConversationEngine && shortcutsEngine) {
        if (isVariableMiddleOutEnabled) {
          // reply with keyPoints的逻辑
          const conversation = await clientConversationEngine.getCurrentConversation()
          // 预留1000个token给summary
          const totalTokens = Math.max(
            (conversation?.meta?.maxTokens || 4000) - 1000,
            3000,
          )
          // 先计算TargetContext的Tokens占用，剩下的再给FullContext
          const {
            isLimit,
            text: sliceOfTargetEmailContext,
            tokens: sliceOfTargetEmailContextUsingTokens,
          } = await sliceTextByTokens(
            EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT,
            totalTokens,
          )
          // 赋值给变量
          EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT = sliceOfTargetEmailContext
          // 如果TargetContext的Tokens占用超过了总的Tokens，就不再计算FullContext的Tokens占用
          if (isLimit) {
            EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT = ''
          } else {
            const { text: sliceOfFullEmailContext } = await sliceTextByTokens(
              EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT,
              totalTokens - sliceOfTargetEmailContextUsingTokens,
            )
            EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT = sliceOfFullEmailContext
          }
          shortcutsEngine.pushActions(
            [
              {
                type: 'SET_VARIABLE_MAP',
                parameters: {
                  VariableMap: {
                    EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT: {
                      key: 'EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT',
                      value: EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT,
                      label: 'Email context',
                      isBuildIn: true,
                      overwrite: true,
                    },
                    EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT: {
                      key: 'EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT',
                      value: EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT,
                      label: 'Target email',
                      isBuildIn: true,
                      overwrite: true,
                    },
                  },
                },
              },
              {
                type: 'RENDER_TEMPLATE',
                parameters: {
                  template: this.output,
                },
              },
            ],
            'after',
          )
        } else {
          shortcutsEngine.pushActions(
            [
              {
                type: 'SET_VARIABLE_MAP',
                parameters: {
                  VariableMap: {
                    EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT: {
                      key: 'EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT',
                      value: EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT,
                      label: 'Email context',
                      isBuildIn: true,
                      overwrite: true,
                    },
                    EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT: {
                      key: 'EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT',
                      value: EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT,
                      label: 'Target email',
                      isBuildIn: true,
                      overwrite: true,
                    },
                  },
                },
              },
              {
                type: 'RENDER_TEMPLATE',
                parameters: {
                  template: this.output,
                },
              },
            ],
            'after',
          )
        }
      }
    } catch (e) {
      this.error = (e as Error).toString()
    }
  }
}
