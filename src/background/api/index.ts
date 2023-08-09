import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { getAccessToken } from '@/utils/request'

export const fetchBackendApi = async (url: string, data: any) => {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return new Error('No access token')
    }
    const response = await fetch(`${APP_USE_CHAT_GPT_API_HOST}${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    const json = await response.json()
    return json
  } catch (e) {
    console.error(e)
  }
}
export const backendApiReportPricingHooks = async (logData: any) => {
  try {
    await fetchBackendApi('/user/cardlog', logData)
  } catch (e) {
    console.error(e)
  }
}
