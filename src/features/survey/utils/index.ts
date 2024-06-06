import { getAccessToken } from '@/background/api/backgroundFetch'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { getBasicInfoForMixpanel } from '@/features/mixpanel/utils'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import { VALID_SURVEY_KEYS } from '@/features/survey/constants'
import { IFunnelSurveySceneType, ISurveyKeyType } from '@/features/survey/types'
import { aesJsonEncrypt } from '@/utils/encryptionHelper'

import { FUNNEL_SURVEY_MIXPANEL_EVENTNAME } from '../constants/funnel_survey'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
export const clientUpdateSurveyStatus = async (
  forceUpdate = false,
  // 默认不穿参数，获取和更新 所有的合法 survey key
  surveyKeys: ISurveyKeyType[] = [...VALID_SURVEY_KEYS],
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

export const getSurveyStatusInChromeExtensionLocalStorage = async () => {
  const appLocalStorage = await getChromeExtensionLocalStorage()
  return appLocalStorage?.surveyStatus ?? null
}

// 把传入的对象的 key 都转换为小写
export const transformRecordKeyNameToLowerCase = (
  record: Record<string, any>,
) => {
  return Object.keys(record).reduce((acc, key) => {
    acc[key.toLowerCase()] = record[key]
    return acc
  }, {} as Record<string, any>)
}

export const submitFunnelSurvey = async (payload: {
  surveyKey: ISurveyKeyType
  funnelSurveySceneType: IFunnelSurveySceneType
  surveyContent: Record<string, any>
  clientUserId: string
}) => {
  try {
    const { surveyKey, funnelSurveySceneType, surveyContent, clientUserId } =
      payload

    const accessToken = await getAccessToken()
    if (accessToken) {
      const fixedSurveyContent =
        transformRecordKeyNameToLowerCase(surveyContent)
      // save survey status
      await clientFetchAPI(
        `${APP_USE_CHAT_GPT_API_HOST}/user/save_user_survey_key`,
        {
          method: 'POST',
          headers: {
            'content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            survey_key: surveyKey,
            survey_content: fixedSurveyContent,
          }),
        },
      )

      const data = {
        event_key: FUNNEL_SURVEY_MIXPANEL_EVENTNAME[funnelSurveySceneType],
        client_user_id: clientUserId,
        data: {
          ...getBasicInfoForMixpanel(),
          ...fixedSurveyContent,
        },
      }

      console.log(
        'submit mixpanel data',
        FUNNEL_SURVEY_MIXPANEL_EVENTNAME[funnelSurveySceneType],
        data,
      )

      // call backend to send mixpanel event
      await clientFetchAPI(
        `${APP_USE_CHAT_GPT_API_HOST}/app/send_mixpanel_log`,
        {
          method: 'POST',
          body: JSON.stringify({
            info: aesJsonEncrypt(data),
          }),
        },
      )

      clientUpdateSurveyStatus(true, [surveyKey])

      return true
    } else {
      return false
    }
  } catch (error) {
    console.log('submitFunnelSurvey error', error)
    return false
  }
}
