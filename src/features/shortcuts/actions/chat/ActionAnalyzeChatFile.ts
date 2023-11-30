import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import {
  getTextTokens,
  sliceTextByTokens,
} from '@/features/shortcuts/utils/tokenizer'
import {
  MAX_UPLOAD_TEXT_FILE_TOKENS,
  stringConvertTxtUpload,
} from '@/features/shortcuts/utils/stringConvertTxtUpload'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'
import { sendLarkBotMessage } from '@/utils/larkBot'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'

/**
 * @since 2023-09-11
 * @description 当用户聊天的内容超过12k的时候生成md5上传成docId, 并且切割12k给聊天的summary
 * @update 2023-11-30 当用户聊天的内容超过120k的时候生成md5上传成docId, 并且切割120k给聊天的summary
 */
export class ActionAnalyzeChatFile extends Action {
  static type: ActionIdentifier = 'ANALYZE_CHAT_FILE'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  async execute(params: any, engine: any) {
    try {
      const fileName =
        this.parameters.AnalyzeChatFileName ||
        params.AnalyzeChatFileName ||
        'Content.txt'
      // NOTE: 业务需求：summary用的是12k的system prompt, 但是后续聊天用的是docId
      const immediateUpdateConversation =
        this.parameters.AnalyzeChatFileImmediateUpdateConversation ||
        params.AnalyzeChatFileImmediateUpdateConversation ||
        false
      let text = params.LAST_ACTION_OUTPUT
      const textTokens = (await getTextTokens(text)).length
      const needUpload = textTokens > PAGE_SUMMARY_MAX_TOKENS
      if (textTokens > MAX_UPLOAD_TEXT_FILE_TOKENS) {
        text = await sliceTextByTokens(text, MAX_UPLOAD_TEXT_FILE_TOKENS)
      }
      /**
       * 总结用的120k system prompt
       */
      const pageSummaryContent = await sliceTextByTokens(
        text,
        PAGE_SUMMARY_MAX_TOKENS,
      )
      if (needUpload) {
        // 异步通知LarkBot
        sendLarkBotMessage(
          `[Summary] tokens has reached maximum limit.`,
          `${JSON.stringify(
            {
              summary_type: getPageSummaryType(),
              url: window.location.href,
              // convert number to k
              total_tokens: `${Math.floor(textTokens / 1000)}k`,
            },
            null,
            4,
          )}`,
          {
            uuid: '95fbacd5-f4a6-4fca-9d77-ac109ae4a94a',
          },
        )
          .then()
          .catch()
        if (immediateUpdateConversation) {
          const docId = await stringConvertTxtUpload(text, fileName)
          await this.updateConversation(engine, {
            meta: {
              docId,
            },
          })
        } else {
          stringConvertTxtUpload(text, fileName).then(async (docId) => {
            await this.updateConversation(engine, {
              meta: {
                docId,
              },
            })
          })
        }
      }
      await this.updateConversation(engine, {
        meta: {
          systemPrompt: `The following text delimited by triple backticks is the context text:
            \`\`\`
            ${pageSummaryContent}
            \`\`\``,
        },
      })
      this.output = pageSummaryContent
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
