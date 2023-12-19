import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'
import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import {
  MAX_UPLOAD_TEXT_FILE_TOKENS,
  stringConvertTxtUpload,
} from '@/features/shortcuts/utils/stringConvertTxtUpload'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import { sendLarkBotMessage } from '@/utils/larkBot'

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
      // NOTE: 业务需求：summary用的是120k的system prompt, 但是后续聊天用的是docId
      const immediateUpdateConversation =
        this.parameters.AnalyzeChatFileImmediateUpdateConversation ||
        params.AnalyzeChatFileImmediateUpdateConversation ||
        false
      const text = params.LAST_ACTION_OUTPUT
      const {
        isLimit,
        text: pageSummarySystemPrompt,
      } = await sliceTextByTokens(text, PAGE_SUMMARY_MAX_TOKENS, {
        thread: 4,
        partOfTextLength: 80 * 1000,
      })
      // 如果触发了limit，就截取其中400k上传作为docId
      if (isLimit) {
        if (immediateUpdateConversation) {
          const uploadData = await sliceTextByTokens(
            text,
            MAX_UPLOAD_TEXT_FILE_TOKENS,
            {
              thread: 4,
              partOfTextLength: 80 * 1000,
            },
          )
          const docId = await stringConvertTxtUpload(uploadData.text, fileName)
          await this.updateConversation(engine, {
            meta: {
              docId,
            },
          })
          // 异步通知LarkBot
          sendLarkBotMessage(
            `[Summary] tokens has reached maximum limit.`,
            `${JSON.stringify(
              {
                summary_type: getPageSummaryType(),
                url: window.location.href,
                // convert number to k
                total_tokens: `${Math.floor(uploadData.tokens / 1000)}k`,
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
        } else {
          sliceTextByTokens(text, MAX_UPLOAD_TEXT_FILE_TOKENS, {
            partOfTextLength: 80 * 1000,
          }).then((uploadData) => {
            // 异步通知LarkBot
            sendLarkBotMessage(
              `[Summary] tokens has reached maximum limit.`,
              `${JSON.stringify(
                {
                  summary_type: getPageSummaryType(),
                  url: window.location.href,
                  // convert number to k
                  total_tokens: `${Math.floor(uploadData.tokens / 1000)}k`,
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
            stringConvertTxtUpload(uploadData.text, fileName).then(
              async (docId) => {
                await this.updateConversation(engine, {
                  meta: {
                    docId,
                  },
                })
              },
            )
          })
        }
      }
      await this.updateConversation(engine, {
        meta: {
          systemPrompt: `The following text delimited by triple backticks is the context text:\n\`\`\`\n${pageSummarySystemPrompt}\n\`\`\``,
        },
      })
      this.output = pageSummarySystemPrompt
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
