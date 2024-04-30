import { NOTIFICATION__SUMMARY__TOKENS_HAVE_REACHED_MAXIMUM_LIMIT__UUID } from '@/constants'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { stringConvertTxtUpload } from '@/features/shortcuts/utils/stringConvertTxtUpload'
import {
  calculateMaxHistoryQuestionResponseTokens,
  sliceTextByTokens,
} from '@/features/shortcuts/utils/tokenizer'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'
import { clientSendMaxAINotification } from '@/utils/sendMaxAINotification/client'

/**
 * @since 2023-09-11
 * @description 当用户聊天的内容超过12k的时候生成md5上传成docId, 并且切割12k给聊天的summary
 * @update 2023-11-30 当用户聊天的内容超过120k的时候生成md5上传成docId, 并且切割120k给聊天的summary
 * @update 2024-03-22 maxSystemPromptTokens = modelMaxTokens - 8000((historyTokens + questionPromptTokens + responseTokens)
 */
export class ActionAnalyzeChatFile extends Action {
  static type: ActionIdentifier = 'ANALYZE_CHAT_FILE'
  // 后端最大上传文本上限
  MAX_UPLOAD_TEXT_FILE_TOKENS = 400 * 1000 // 400k
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
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
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
      const conversationEngine = engine.clientConversationEngine
      const conversationId = conversationEngine?.currentConversationId || ''
      if (this.isStopAction) return
      const conversation = await conversationEngine?.getCurrentConversation()
      if (this.isStopAction) return
      const maxAIModelTokens =
        this.parameters.AnalyzeChatFileSystemPromptTokenLimit ||
        conversation?.meta?.maxTokens ||
        4096
      const systemPromptTokensLimit =
        maxAIModelTokens -
        calculateMaxHistoryQuestionResponseTokens(maxAIModelTokens)
      const text =
        this.parameters?.compliedTemplate || params.LAST_ACTION_OUTPUT || ''
      const { isLimit, text: pageSummarySystemPrompt } =
        await sliceTextByTokens(text, systemPromptTokensLimit, {
          thread: 4,
          partOfTextLength: 20 * 1000,
        })
      if (this.isStopAction) return
      // 如果触发了limit，就截取其中400k上传作为docId
      if (isLimit) {
        if (immediateUpdateConversation) {
          const uploadData = await sliceTextByTokens(
            text,
            systemPromptTokensLimit,
            {
              thread: 4,
              partOfTextLength: 20 * 1000,
            },
          )
          const docId = await stringConvertTxtUpload(uploadData.text, fileName)
          await conversationEngine?.updateConversation(
            {
              meta: {
                docId,
              },
            },
            conversationId,
            true,
          )
          if (this.isStopAction) return
          // 异步通知LarkBot
          clientSendMaxAINotification(
            'SUMMARY',
            `[Summary] tokens have reached maximum limit.`,
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
              uuid: NOTIFICATION__SUMMARY__TOKENS_HAVE_REACHED_MAXIMUM_LIMIT__UUID,
            },
          )
            .then()
            .catch()
        } else {
          sliceTextByTokens(text, this.MAX_UPLOAD_TEXT_FILE_TOKENS, {
            thread: 4,
            partOfTextLength: 80 * 1000,
          }).then((uploadData) => {
            // 异步通知LarkBot
            clientSendMaxAINotification(
              'SUMMARY',
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
                uuid: NOTIFICATION__SUMMARY__TOKENS_HAVE_REACHED_MAXIMUM_LIMIT__UUID,
              },
            )
              .then()
              .catch()
            if (this.isStopAction) return
            stringConvertTxtUpload(uploadData.text, fileName).then(
              async (docId) => {
                await conversationEngine?.updateConversation(
                  {
                    meta: {
                      docId,
                    },
                  },
                  conversationId,
                  true,
                )
              },
            )
          })
        }
      }
      if (this.isStopAction) return
      await conversationEngine?.updateConversation(
        {
          meta: {
            systemPrompt: `The following text delimited by triple backticks is the context text:\n\`\`\`\n${pageSummarySystemPrompt}\n\`\`\``,
          },
        },
        conversationId,
        true,
      )
      if (this.isStopAction) return
      this.output = pageSummarySystemPrompt
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    this.isStopAction = true
    await stopActionMessageStatus(params)
    return true
  }
}
