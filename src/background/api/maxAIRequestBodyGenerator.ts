import cloneDeep from 'lodash-es/cloneDeep'

import {
  IMaxAIChatGPTBackendAPIType,
  IMaxAIChatGPTBackendBodyType,
  IMaxAIChatMessageContent,
} from '@/background/src/chat/UseChatGPTChat/types'
import { CHAT__AI_MODEL__SUGGESTION__PROMPT_ID } from '@/constants'
import { IPageSummaryNavType } from '@/features/chat-base/summary/types'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import {
  IAIResponseMessage,
  IUserMessageMetaType,
} from '@/features/indexed_db/conversations/models/Message'
import { MaxAIPromptActionConfig } from '@/features/shortcuts/types/Extra/MaxAIPromptActionConfig'

/**
 * 如果question有promptActionConfig，生成对应的promptActionBody
 * @param originalPostBody
 * @param promptActionConfig
 */
export const maxAIRequestBodyPromptActionGenerator = async (
  originalPostBody: any,
  promptActionConfig?: MaxAIPromptActionConfig,
) => {
  try {
    const clonePostBody: any = cloneDeep(originalPostBody)
    clonePostBody.prompt_id = promptActionConfig?.promptId
    clonePostBody.prompt_name = promptActionConfig?.promptName
    clonePostBody.prompt_action_type =
      promptActionConfig?.promptActionType || ''
    clonePostBody.prompt_inputs = promptActionConfig?.variables.reduce<
      Record<string, string>
    >((variableMap, variable) => {
      if (variable.VariableName) {
        variableMap[variable.VariableName] = variable.defaultValue || ''
      }
      return variableMap
    }, {})
    /**
     * 这里是因为用户用了AI model suggestion的prompt，需要把message_content的text的内容当作CURRENT_PROMPT
     * 但是如果用户自己填了CURRENT_PROMPT，就不需要这个操作
     */
    if (
      clonePostBody.prompt_id === CHAT__AI_MODEL__SUGGESTION__PROMPT_ID &&
      Object.prototype.hasOwnProperty.call(
        clonePostBody.prompt_inputs,
        'CURRENT_PROMPT',
      ) &&
      !clonePostBody.prompt_inputs.CURRENT_PROMPT
    ) {
      const promptTemplate: IMaxAIChatMessageContent =
        clonePostBody.message_content?.find(
          (content: IMaxAIChatMessageContent) => {
            return content.type === 'text'
          },
        )
      if (promptTemplate) {
        clonePostBody.prompt_inputs.CURRENT_PROMPT = promptTemplate.text || ''
      }
    }
    // 去掉message_content里的text
    clonePostBody.message_content = clonePostBody.message_content?.filter(
      (content: IMaxAIChatMessageContent) => {
        return content.type !== 'text'
      },
    )
    // 如果有AIModel，加上model_name
    if (promptActionConfig?.AIModel) {
      clonePostBody.model_name = promptActionConfig?.AIModel
    }
    return clonePostBody
  } catch (e) {
    return originalPostBody
  }
}

/**
 * 如果有analysisData，生成对应的analysisBody
 * @param originalPostBody
 * @param analysisData
 */
export const maxAIRequestBodyAnalysisGenerator = async (
  originalPostBody: any,
  analysisData?: IUserMessageMetaType['analytics'],
) => {
  try {
    const clonePostBody: any = cloneDeep(originalPostBody)
    clonePostBody.prompt_type = analysisData?.promptType || ''
    clonePostBody.feature_name = analysisData?.featureName || ''
    return clonePostBody
  } catch (e) {
    return originalPostBody
  }
}

/**
 * 根据summary nav类型返回summary接口对应的type
 * @param navType
 */
const maxAIRequestBodySummaryType = (
  navType?: IPageSummaryNavType | string,
) => {
  switch (navType) {
    case 'all':
      return 'standard'
    case 'summary':
      return 'short'
    case 'keyTakeaways':
      return 'key_point'
    case 'actions':
      return 'action'
    case 'comment':
      return 'comment'
    case 'transcript':
      return 'transcript'
    case 'timestamped':
      return 'timestamped'
  }
  return 'customize'
}

/**
 * 针对summary总结的请求，返回不同的api和生成对应的body
 * @param originalPostBody
 * @param conversation
 * @param summaryMessage
 * @param promptActionConfig
 */
export const maxAIRequestBodySummaryGenerator = async (
  originalPostBody: IMaxAIChatGPTBackendBodyType,
  conversation: IConversation,
  summaryMessage: IAIResponseMessage,
  promptActionConfig?: MaxAIPromptActionConfig,
) => {
  let backendAPI: IMaxAIChatGPTBackendAPIType = 'summary/v2/webpage'
  const postBody = promptActionConfig
    ? await maxAIRequestBodyPromptActionGenerator(
        originalPostBody,
        promptActionConfig,
      )
    : cloneDeep(originalPostBody)
  switch (conversation.meta.pageSummaryType) {
    case 'PAGE_SUMMARY':
      backendAPI = 'summary/v2/webpage'
      break
    case 'DEFAULT_EMAIL_SUMMARY':
      backendAPI = 'summary/v2/email'
      break
    case 'YOUTUBE_VIDEO_SUMMARY':
      backendAPI = 'summary/v2/videosite'
      break
    case 'PDF_CRX_SUMMARY':
      backendAPI = 'summary/v2/pdf'
      break
  }
  postBody.summary_type = maxAIRequestBodySummaryType(
    summaryMessage.originalMessage?.metadata?.navMetadata?.key || 'all',
  )
  postBody.doc_id = conversation.meta.pageSummary?.docId

  // TODO 对于custom prompt模板要替换<<SUMMARY_PAGE_CONTENT_REPRESENTATION>>为对应的变量名
  // 这里和summaryActionHelper.ts内的变量对应，临时这么更改
  if (postBody.prompt_inputs?.PROMPT_TEMPLATE) {
    postBody.prompt_inputs.PROMPT_TEMPLATE =
      postBody.prompt_inputs.PROMPT_TEMPLATE.replaceAll(
        '<<SUMMARY_PAGE_CONTENT_REPRESENTATION>>',
        postBody.prompt_inputs.DOC_MAIN_CONTEXT
          ? '{{DOC_MAIN_CONTEXT}}'
          : '{{PAGE_CONTENT}}',
      )
  }
  // 后端会自动调整model
  delete (postBody as any).model_name
  return { backendAPI, postBody }
}

/**
 * 针对summary对话的请求，返回不同的api和生成对应的body
 * @param originalPostBody
 * @param conversation
 * @param summaryMessage
 */
export const maxAIRequestBodySummaryChatGenerator = async (
  originalPostBody: IMaxAIChatGPTBackendBodyType,
  conversation: IConversation,
  summaryMessage?: IAIResponseMessage,
) => {
  // summary问答
  let backendAPI: IMaxAIChatGPTBackendAPIType = 'summary/v2/qa'
  const postBody = cloneDeep(originalPostBody)
  if (conversation.meta.pageSummary) {
    // 新版本数据
    if (conversation.meta.docId) {
      // 大文件走chat_with_document对话逻辑
      backendAPI = 'chat_with_document/v2'
    } else {
      postBody.doc_id = conversation.meta.pageSummary.docId
      if (
        summaryMessage?.originalMessage?.metadata?.isComplete ||
        summaryMessage?.originalMessage?.content?.text
      ) {
        // 完成或者有text内容说明请求成功了，后端成功拿到页面数据和summary的短文docId
        postBody.need_create = false
        postBody.summary_type = maxAIRequestBodySummaryType(
          summaryMessage.originalMessage?.metadata?.navMetadata?.key,
        )
        // 目前不传递会报错
        postBody.prompt_inputs = {}
      } else {
        // 这里代表第一条summary请求失败了，目前失败不影响后续对话，需要带上对应的PROMPT_INPUTS，后端需要此数据生成对应的systemPrompt
        postBody.need_create = true
        postBody.summary_type = maxAIRequestBodySummaryType(
          summaryMessage?.originalMessage?.metadata?.navMetadata?.key || 'all',
        )
        // 拿到summaryMessage的variables拼接到prompt_inputs里
        if (conversation.meta.pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY') {
          postBody.prompt_inputs = {
            DOC_MAIN_CONTEXT: conversation.meta.pageSummary.content || '',
          }
        } else {
          postBody.prompt_inputs = {
            PAGE_CONTENT: conversation.meta.pageSummary.content || '',
          }
        }
      }
    }
  } else {
    // 对于旧版本数据走之前的逻辑
    backendAPI = 'get_summarize_response'
  }
  // 后端会自动调整model
  delete (postBody as any).model_name
  return { backendAPI, postBody }
}

/**
 * 针对长文对话的请求，返回不同的api和生成对应的body
 * @param originalPostBody
 */
export const maxAIRequestBodyDocChatGenerator = (
  originalPostBody: IMaxAIChatGPTBackendBodyType,
) => {
  const backendAPI: IMaxAIChatGPTBackendAPIType = 'chat_with_document/v2'
  const postBody = cloneDeep(originalPostBody)
  postBody.model_name = 'gpt-3.5-turbo-16k'
  if (
    postBody.prompt_id === postBody.prompt_name &&
    postBody.prompt_id === 'chat'
  ) {
    postBody.prompt_id = 'summary_chat'
    postBody.prompt_name = 'summary_chat'
  }
  const messageContent = postBody.message_content?.find(
    (content) => content.type === 'text',
  )
  const messageContentText = messageContent?.text || ''
  postBody.message_content = messageContentText as any
  // 大文件聊天的接口不支持新的message结构，换成老的 - @xiang.xu - 2024-01-15
  postBody.chat_history = postBody.chat_history?.map((history) => {
    // 老得结构
    // {
    //   type: 'human' | 'ai' | 'generic' | 'system' | 'function'
    //   data: {
    //     content: string
    //     additional_kwargs: {
    //       [key: string]: any
    //     }
    //   }
    // }
    return {
      type: history.role,
      data: {
        content:
          history.content.find((content) => content.type === 'text')?.text ||
          '',
        additional_kwargs: {},
      },
    } as any
  })
  return { backendAPI, postBody }
}
