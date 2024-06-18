import cloneDeep from 'lodash-es/cloneDeep'

import { IMaxAIChatMessageContent } from '@/background/src/chat/UseChatGPTChat/types'
import { IUserMessageMetaType } from '@/features/indexed_db/conversations/models/Message'
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
        // 去掉message_content里的text
        clonePostBody.message_content = clonePostBody.message_content?.filter(
          (content: IMaxAIChatMessageContent) => {
            return content.type !== 'text'
          },
        )
        clonePostBody.prompt_inputs.CURRENT_PROMPT = promptTemplate.text || ''
      }
    } else {
      // 删掉message_content
      delete clonePostBody.message_content
    }
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
