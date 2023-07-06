import {
  APP_USE_CHAT_GPT_API_HOST,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
} from '@/constants'
import Browser from 'webextension-polyfill'
import { IUseChatGPTUserInfo, IUserRole } from '@/features/auth/types'
import { setDailyUsageLimitData } from '@/features/chatgpt/utils/logAndConfirmDailyUsageLimit'
import isArray from 'lodash-es/isArray'

export const getChromeExtensionAccessToken = async (): Promise<string> => {
  const cache = await Browser.storage.local.get(
    CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  )
  if (cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]) {
    // 应该用accessToken
    return cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
      ?.refreshToken as string
  }
  return ''
}

export const fetchUserSubscriptionInfo = async (): Promise<
  IUserRole | undefined
> => {
  try {
    const token = await getChromeExtensionAccessToken()
    if (!token) {
      return undefined
    }
    const response = await fetch(
      `${APP_USE_CHAT_GPT_API_HOST}/user/get_user_subscription_info`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    if (response.ok) {
      const result = await response.json()
      if (result.status === 'OK' && result.data) {
        // has_reached_limit:true
        // limit_value:5
        // next_reset_timestamp:1688515200
        // roles:[]
        // usage:19
        if (result?.data?.roles && isArray(result.data.roles)) {
          await setDailyUsageLimitData({
            has_reached_limit: result.data.has_reached_limit,
            limit_value: result.data.limit_value,
            next_reset_timestamp: result.data.next_reset_timestamp,
            usage: result.data.usage,
          })
          const role = result.data.roles.find(
            (role: { name: string; exp_time: number }) => role.name === 'pro',
          ) || {
            name: 'free',
            exp_time: 0,
          }
          return {
            name: role.name,
            exp_time: role.exp_time,
          }
        }
      }
    }
    return undefined
  } catch (e) {
    console.log('backgroundFetchUserSubscriptionInfo error', e)
    return undefined
  }
}

export const fetchUserInfo = async (): Promise<
  IUseChatGPTUserInfo | undefined
> => {
  try {
    const token = await getChromeExtensionAccessToken()
    if (!token) {
      return undefined
    }
    const response = await fetch(
      `${APP_USE_CHAT_GPT_API_HOST}/user/get_user_info`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    const role = await fetchUserSubscriptionInfo()
    if (response.ok) {
      const result = await response.json()
      if (result.status === 'OK' && result?.data?.email) {
        // HACK: remove conversationId
        if (result.data?.conversationId) {
          delete result.data.conversationId
        }
        result.data.role = role
        return result.data as IUseChatGPTUserInfo
      }
    }
    return undefined
  } catch (e) {
    return undefined
  }
}
