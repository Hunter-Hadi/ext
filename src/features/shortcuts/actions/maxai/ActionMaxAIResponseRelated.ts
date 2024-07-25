import { APP_VERSION, SUMMARY__RELATED_QUESTIONS__PROMPT_ID } from '@/constants'
import { generateQuestionAnalyticsData } from '@/features/auth/utils/log'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IAIResponseOriginalMessageMetaDeepRelatedData } from '@/features/indexed_db/conversations/models/Message'
import {
  IShortcutEngineExternalEngine,
  withLoadingDecorators,
} from '@/features/shortcuts'
import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import { TranscriptResponse } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import { TranscriptTimestampedParamType } from '@/features/shortcuts/actions/web/socialMedia/ActionGetYoutubeSocialMediaSummaryInfo/ActionGetYoutubeSocialMediaTranscriptTimestamped'
import Action from '@/features/shortcuts/core/Action'
import { templateParserDecorator } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import { sliceTextByTokens } from '@/features/shortcuts/utils/tokenizer'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

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
    const { clientConversationEngine, clientMessageChannelEngine } = engine
    const conversationId =
      clientConversationEngine?.currentConversationIdRef.current || ''
    const conversation =
      await clientConversationEngine?.getCurrentConversation()
    const AIResponseMessage = conversationId
      ? await ClientConversationMessageManager.getMessageByMessageType(
          conversationId,
          'ai',
          'latest',
        )
      : null
    let summaryContent = this.parameters.compliedTemplate || ''
    // 处理额外信息，比如youtube transcript和timestamped
    if (
      conversation?.type === 'Summary' &&
      conversation?.meta?.pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY' &&
      AIResponseMessage &&
      summaryContent &&
      isAIMessage(AIResponseMessage)
    ) {
      const navKey =
        AIResponseMessage?.originalMessage?.metadata?.navMetadata?.key
      /**
       * 转换timestamped或者transcript的内容
       * ## xxx
       * ### xx
       * ### xx
       */
      if (navKey === 'timestamped' || navKey === 'transcript') {
        try {
          const transcript: (
            | TranscriptTimestampedParamType
            | TranscriptResponse
          )[] = JSON.parse(summaryContent)
          if (Array.isArray(transcript) && transcript.length) {
            summaryContent = ''
            transcript
              .filter((item) =>
                item.status ? item.status === 'complete' : true,
              )
              .forEach((item, index) => {
                if (index > 0) summaryContent += '\n'
                // summaryContent += `${formatSecondsAsTimestamp(item.start)} ${
                //   item.text
                // }\n`
                summaryContent += `## ${item.text}\n`
                item.children?.forEach((child) => {
                  // summaryContent += `   - ${formatSecondsAsTimestamp(
                  //   child.start,
                  // )} ${child.text}\n`
                  summaryContent += `### ${child.text}\n`
                })
              })
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
    if (summaryContent) {
      // related questions用的model是gpt-3.5-turbo，所以这里的max_response_tokens是16384
      // transcript目前没有处理内容，视频很长的情况下transcript会很大，这里需要做处理
      // 预留1000 token给related questions response
      const { isLimit, text } = await sliceTextByTokens(
        summaryContent,
        16384 - 1000,
      )
      if (isLimit) {
        summaryContent = text
      }
      const analyticsData = await generateQuestionAnalyticsData(
        {
          conversationId: clientConversationEngine?.currentConversationId,
          meta: {
            analytics: {},
          },
        } as any,
        SUMMARY__RELATED_QUESTIONS__PROMPT_ID,
      )
      /**
       * 前端不再依赖call_api来触发paywall付费卡点了
       * call_api主要是用来做log记录的，让我们自己能看到、分析用户的使用情况
       */
      clientMessageChannelEngine
        ?.postMessage({
          event: 'Client_logCallApiRequest',
          data: {
            name: 'related_questions',
            id: SUMMARY__RELATED_QUESTIONS__PROMPT_ID,
            type: analyticsData.promptType,
            featureName: analyticsData.featureName,
            host: getCurrentDomainHost(),
            conversationId: clientConversationEngine?.currentConversationId,
            url: location.href,
          },
        })
        .then()
        .catch()
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
        prompt_name: analyticsData.featureName,
        prompt_type: analyticsData.promptType,
        prompt_action_type: 'chat_complete',
        feature_name: '',
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

  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    await stopActionMessageStatus(params)
    return true
  }
}
