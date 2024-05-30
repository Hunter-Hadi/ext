import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { VALID_SURVEY_KEYS } from '@/features/survey/constants'
import { ISurveyKeyType } from '@/features/survey/types'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
export const clientUpdateSurveyStatus = async (
  forceUpdate = false,
  // 默认不穿参数，获取和更新 所有的合法 survey key
  surveyKeys = VALID_SURVEY_KEYS,
): Promise<Partial<Record<ISurveyKeyType, boolean>> | null> => {
  const result = await port.postMessage({
    event: 'Client_updateMaxAISurveyStatus',
    data: {
      surveyKeys,
      forceUpdate,
    },
  })
  return result.data || {}
}
