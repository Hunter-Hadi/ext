import dayjs from 'dayjs'
import isArray from 'lodash-es/isArray'
import Browser from 'webextension-polyfill'

import {
  APP_USE_CHAT_GPT_API_HOST,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
} from '@/constants'
import {
  IUseChatGPTUserInfo,
  IUserPlanNameType,
  IUserRole,
} from '@/features/auth/types'
import { setDailyUsageLimitData } from '@/features/chatgpt/utils/logAndConfirmDailyUsageLimit'
import { sendLarkBotMessage } from '@/utils/larkBot'

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

/**
 * 获取用户信息
 * @param forceUpdate - 当用户更新plan的时候需要强制更新
 */
export const getChromeExtensionUserInfo = async (
  forceUpdate: boolean,
): Promise<IUseChatGPTUserInfo | undefined> => {
  try {
    const cache = await Browser.storage.local.get(
      CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
    )
    if (cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]) {
      let userData =
        cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
          ?.userData
      let isUpdated = false
      if (!userData || forceUpdate) {
        userData = await fetchUserInfo()
        isUpdated = true
      }
      if (forceUpdate || !userData.role) {
        userData.role = await fetchUserSubscriptionInfo()
        isUpdated = true
      }
      if (isUpdated) {
        await Browser.storage.local.set({
          [CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]: {
            ...cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY],
            userData,
          },
        })
      }
      return userData
    }
    return undefined
  } catch (e) {
    // get chrome extension user info error
    return undefined
  }
}
/**
 * 获取用户id
 */
export const getMaxAIChromeExtensionUserId = async (): Promise<string> => {
  const cache = await Browser.storage.local.get(
    CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  )
  if (cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]) {
    return cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
      ?.userInfo?.subject?.user_id as string
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
          let is_one_times_pay_user = false
          await setDailyUsageLimitData({
            has_reached_limit: result.data.has_reached_limit,
            limit_value: result.data.limit_value,
            next_reset_timestamp: result.data.next_reset_timestamp,
            usage: result.data.usage,
          })
          let role =
            result.data.roles.find(
              (role: { name: string; exp_time: number }) =>
                role.name === 'elite',
            ) ||
            result.data.roles.find(
              (role: { name: string; exp_time: number }) => role.name === 'pro',
            ) ||
            result.data.roles[0]
          if (!role) {
            role = {
              name: 'free',
              exp_time: 0,
            }
          }
          const { name } = role
          // 如果角色不是free，判断是否为一次性付费用户
          if (
            name !== 'free' &&
            result.data?.current_period_end &&
            result.data?.subscription_type &&
            result.data?.subscription_type !== 'SUBSCRIPTION'
          ) {
            // 一次性付费用户
            is_one_times_pay_user = true
            // 判断是否过期
            // current_period_end是unix时间戳
            const expireTime = dayjs(result.data.current_period_end * 1000)
              .utc()
              .valueOf()
            const now = dayjs().utc().valueOf()
            if (expireTime - now > 0) {
              // 未过期
              role.exp_time = expireTime
            } else {
              // 过期
              role.exp_time = 0
              role.name = 'free'
            }
          }
          if (role.name === 'pro' && result.data.has_reached_limit) {
            sendLarkBotMessage(
              `[Pricing] Pro [subscription_info] has reached the limit`,
              `Pro token [${token}] call api has reached the limit.\n${JSON.stringify(
                result?.data,
              )}`,
              {
                uuid: '7a04bc02-6155-4253-bcdb-ade3db6de492',
              },
            )
          }
          if (role === 'pro' && dayjs().utc().diff(dayjs(role.exp_time)) > 0) {
            sendLarkBotMessage(
              '[API] error response roles',
              `Pro token [${token}]\n${JSON.stringify(result?.data)}`,
              {
                uuid: '6f02f533-def6-4696-b14e-1b00c2d9a4df',
              },
            )
          }
          if (role.name === 'elite' && result.data.has_reached_limit) {
            sendLarkBotMessage(
              `[Pricing] Elite [subscription_info] has reached the limit`,
              `Elite token [${token}] call api has reached the limit.\n${JSON.stringify(
                result?.data,
              )}`,
              {
                uuid: '7a04bc02-6155-4253-bcdb-ade3db6de492',
              },
            )
          }
          if (
            role === 'elite' &&
            dayjs().utc().diff(dayjs(role.exp_time)) > 0
          ) {
            sendLarkBotMessage(
              '[API] error response roles',
              `Elite token [${token}]\n${JSON.stringify(result?.data)}`,
              {
                uuid: '6f02f533-def6-4696-b14e-1b00c2d9a4df',
              },
            )
          }
          let subscription_plan_name: IUserPlanNameType = 'UNKNOWN'
          // 因为这是另一个接口的字段，所以套着拿
          const cache = await Browser.storage.local.get(
            CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
          )
          if (cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]) {
            const userData =
              cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
                ?.userData
            if (userData.subscription_plan_name) {
              subscription_plan_name = userData.subscription_plan_name
            }
          }
          return {
            name: role.name,
            exp_time: role.exp_time,
            is_one_times_pay_user,
            subscription_plan_name,
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
