import cloneDeep from 'lodash-es/cloneDeep'

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
    // 去掉message_content
    delete clonePostBody.message_content
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
