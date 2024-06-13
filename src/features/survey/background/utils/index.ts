import { backgroundRequestHeadersGenerator } from '@/background/api/backgroundRequestHeadersGenerator'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { VALID_SURVEY_KEYS } from '@/features/survey/constants'
import { ISurveyKeyType } from '@/features/survey/types'

export const updateSurveyStatusInBackground = async (
  forceUpdate = false,
  // 默认不穿参数，获取和更新 所有的合法 survey key
  surveyKeys = VALID_SURVEY_KEYS,
  requestId?: string,
): Promise<Partial<Record<ISurveyKeyType, boolean>> | null> => {
  try {
    const cacheData = await getChromeExtensionLocalStorage()
    if (!forceUpdate) {
      return cacheData.surveyStatus ?? null
    }
    const token = await getMaxAIChromeExtensionAccessToken()
    if (!token) {
      return null
    }
    const result = await fetch(
      `${APP_USE_CHAT_GPT_API_HOST}/user/find_user_survey_key`,
      {
        method: 'POST',
        headers: backgroundRequestHeadersGenerator.getTaskIdHeaders(requestId, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
        body: JSON.stringify({
          survey_keys: surveyKeys,
        }),
      },
    )
    const resultJson = await result.json()
    if (resultJson.msg === 'success' && resultJson.status === 'OK') {
      const needToReturnSurveyKeyObjs: Partial<
        Record<ISurveyKeyType, boolean>
      > = {}
      const responseData = resultJson.data?.survey_key_objs
      if (responseData && responseData.length > 0) {
        responseData.forEach((responseDataItem: { key: ISurveyKeyType }) => {
          if (responseDataItem && responseDataItem.key) {
            needToReturnSurveyKeyObjs[responseDataItem.key] = true
          }
        })
      }
      await setChromeExtensionLocalStorage({
        surveyStatus: needToReturnSurveyKeyObjs,
      })
      return needToReturnSurveyKeyObjs
    }
    return null
  } catch (error) {
    return null
  }
}
