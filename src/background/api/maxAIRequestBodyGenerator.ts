import cloneDeep from 'lodash-es/cloneDeep'

import {
  IMaxAIChatGPTBackendAPIType,
  IMaxAIChatGPTBackendBodyType,
  IMaxAIChatMessageContent,
} from '@/background/src/chat/UseChatGPTChat/types'
import { CHAT__AI_MODEL__SUGGESTION__PROMPT_ID } from '@/constants'
import {
  IPageSummaryNavType,
  IPageSummaryType,
} from '@/features/chat-base/summary/types'
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
    if (analysisData?.promptId) {
      clonePostBody.prompt_id = analysisData.promptId
    }
    if (analysisData?.promptName) {
      clonePostBody.prompt_name = analysisData.promptName
    }
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
 * 根据summary type返回对应的接口和chat的doc type
 */
const maxAIRequestBodyDocType = (summaryType: IPageSummaryType) => {
  switch (summaryType) {
    case 'PAGE_SUMMARY':
      return 'webpage'
    case 'DEFAULT_EMAIL_SUMMARY':
      return 'email'
    case 'YOUTUBE_VIDEO_SUMMARY':
      return 'videosite'
    case 'PDF_CRX_SUMMARY':
      return 'pdf'
  }
  return 'webpage'
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
  let backendAPI: IMaxAIChatGPTBackendAPIType = 'summary/v3/webpage'
  const postBody = promptActionConfig
    ? await maxAIRequestBodyPromptActionGenerator(
        originalPostBody,
        promptActionConfig,
      )
    : cloneDeep(originalPostBody)
  switch (conversation.meta.pageSummaryType) {
    case 'PAGE_SUMMARY':
      backendAPI = 'summary/v3/webpage'
      break
    case 'DEFAULT_EMAIL_SUMMARY':
      backendAPI = 'summary/v3/email'
      break
    case 'YOUTUBE_VIDEO_SUMMARY':
      backendAPI = 'summary/v3/videosite'
      break
    case 'PDF_CRX_SUMMARY':
      backendAPI = 'summary/v3/pdf'
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
        '{{PAGE_CONTENT}}',
      )
  }
  // 后端会自动调整model
  delete (postBody as any).model_name
  return { backendAPI, postBody }
}

/**
 * 针对summary对话的请求，返回不同的api和生成对应的body
 * 理论上打开summary chat的时候可以强制走新的逻辑，之后处理，在这里先做个兼容，目前会有以下情况
 * 1. conversation.meta.docId，长文逻辑
 * 2. conversation.meta.pageSummary.docId，pageSummary.content有内容 v2接口逻辑，需要传递PAGE_CONTENT
 * 3. conversation.meta.pageSummary.docId，pageSummary.content无内容 v3接口逻辑，不需要传递PAGE_CONTENT
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
  if (conversation.meta.docId) {
    // 长文还是走chat_with_document逻辑
    backendAPI = 'chat_with_document/v2'
    postBody.doc_id = conversation.meta.docId
  } else if (conversation.meta.pageSummary?.docId) {
    const docType = maxAIRequestBodyDocType(conversation.meta.pageSummaryType!)
    postBody.doc_id = conversation.meta.pageSummary.docId
    postBody.doc_type = docType
    // chat逻辑，不传递docId或者服务端没找到docId会报错
    if (conversation.meta.pageSummary.content) {
      // 走v2逻辑
      backendAPI = 'summary/v2/qa'
    } else {
      // 走v3逻辑
      backendAPI = `summary/v3/qa/${docType}`
    }
    if (
      summaryMessage?.originalMessage?.content?.text ||
      !conversation.meta.pageSummary.content
    ) {
      // 有text内容说明请求成功了，后端成功拿到页面数据和短文docId
      postBody.need_create = false
      postBody.summary_type = maxAIRequestBodySummaryType(
        summaryMessage?.originalMessage?.metadata?.navMetadata?.key || 'all',
      )
      // 目前不传递会报错
      postBody.prompt_inputs = {}
      // 时间线对话需要传递pageUrl
      if (conversation.meta.pageSummaryType === 'YOUTUBE_VIDEO_SUMMARY') {
        postBody.prompt_inputs.CURRENT_WEBPAGE_URL =
          conversation.meta.sourceWebpage?.url || ''
      }
    } else {
      // 这里代表第一条summary请求失败了，目前失败不影响后续对话，需要带上对应的PROMPT_INPUTS，后端需要此数据生成对应的prompt
      postBody.need_create = true
      postBody.summary_type = maxAIRequestBodySummaryType(
        summaryMessage?.originalMessage?.metadata?.navMetadata?.key || 'all',
      )
      // 拿到summary message的variables拼接到prompt_inputs里
      postBody.prompt_inputs = {
        CURRENT_WEBPAGE_URL: conversation.meta.sourceWebpage?.url || '',
        CURRENT_WEBSITE_DOMAIN: conversation.meta.sourceWebpage?.url || '',
      }
      postBody.prompt_inputs.PAGE_CONTENT =
        conversation.meta.pageSummary.content || ''
    }
  } else {
    // 对于旧版本数据走之前的逻辑，旧版本没有存储pageSummary.content的信息
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
