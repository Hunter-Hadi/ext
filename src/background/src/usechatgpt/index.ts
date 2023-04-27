import { APP_USE_CHAT_GPT_API_HOST } from '@/types'

export type IUseChatGPTUserInfo = {
  chatgpt_expires_at: string
  email: string
  referral_code: string
  referred_cnt: null | number
}

export const backgroundFetchUseChatGPTUserInfo = async (
  token: string,
): Promise<IUseChatGPTUserInfo | undefined> => {
  try {
    const response = await fetch(
      `${APP_USE_CHAT_GPT_API_HOST}/user/get_user_info`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    if (response.ok) {
      const result = await response.json()
      if (result.status === 'OK' && result?.data?.email) {
        // HACK: remove conversationId
        if (result.data?.conversationId) {
          delete result.data.conversationId
        }
        return result.data as IUseChatGPTUserInfo
      }
    }
    return undefined
  } catch (e) {
    return undefined
  }
}
