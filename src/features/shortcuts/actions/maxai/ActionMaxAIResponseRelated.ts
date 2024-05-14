import { APP_VERSION, SUMMARY__RELATED_QUESTIONS__PROMPT_ID } from '@/constants'
import { IAIResponseOriginalMessageMetaDeepRelatedData } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import {
  IShortcutEngineExternalEngine,
  withLoadingDecorators,
} from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'

/**
 * @since 2024-05-13
 * @description 生成AI response相关的related questions
 */
export class ActionMaxAIResponseRelated extends Action {
  static type: ActionIdentifier = 'MAXAI_RESPONSE_RELATED'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @templateParserDecorator()
  @withLoadingDecorators()
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    // 生成summary相关的related questions
    const { clientConversationEngine } = engine
    const conversation =
      await clientConversationEngine?.getCurrentConversation()
    const messages = conversation?.messages || []
    // TODO: 第一版只给summary的默认的all的related questions，后续可以根据需求再扩展
    let needToGenerateRelatedQuestions = false
    const AIResponseMessage = messages[0]
    if (isAIMessage(AIResponseMessage)) {
      needToGenerateRelatedQuestions =
        AIResponseMessage?.originalMessage?.metadata?.navMetadata?.key === 'all'
    }
    // const systemPrompt = conversation?.meta.systemPrompt
    const summaryContent = this.parameters.compliedTemplate || ''
    if (summaryContent && needToGenerateRelatedQuestions) {
      const result = await clientFetchMaxAIAPI<{
        status: string
        text: string
        conversation_id: string | null
      }>(`/gpt/get_related_questions`, {
        chat_history: [
          // {
          //   role: 'system',
          //   content: [
          //     {
          //       type: 'text',
          //       text: sliceTextByTokens(
          //         systemPrompt,
          //         // 因为这个接口是用来生成related questions的，用的model是gpt-3.5-turbo，所以这里的max_response_tokens是16384
          //         calculateMaxResponseTokens(16384),
          //       ),
          //     },
          //   ],
          // },
          {
            role: 'ai',
            content: [
              {
                type: 'text',
                text: summaryContent,
              },
            ],
          },
        ],
        message_content: [],
        streaming: false,
        chrome_extension_version: APP_VERSION,
        prompt_id: SUMMARY__RELATED_QUESTIONS__PROMPT_ID,
        prompt_name: 'related_questions',
        temperature: 1,
      })
      const relatedQuestionsText = result?.data?.text || '[]'
      try {
        const relatedQuestions = JSON.parse(relatedQuestionsText)
        if (
          relatedQuestions &&
          Array.isArray(relatedQuestions) &&
          relatedQuestions.length > 0
        ) {
          this.output = JSON.stringify(
            relatedQuestions.map((question) => {
              const returnData: IAIResponseOriginalMessageMetaDeepRelatedData =
                {
                  title: question,
                }
              return returnData
            }),
          )
        }
      } catch (e) {
        console.error('ActionMaxAIResponseRelated', e)
      }
    }
  }
}
