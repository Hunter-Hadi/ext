import dayjs from 'dayjs'
import cloneDeep from 'lodash-es/cloneDeep'
import isArray from 'lodash-es/isArray'
import Browser from 'webextension-polyfill'

import {
  APP_USE_CHAT_GPT_API_HOST,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY,
  CHROME_EXTENSION_LOCAL_STORAGE_USER_QUOTA_USAGE_SAVE_KEY,
} from '@/constants'
import { PAYING_USER_ROLE_NAME } from '@/features/auth/constants'
import {
  IUseChatGPTUserInfo,
  IUserFeatureQuotaInfo,
  IUserPlanNameType,
  IUserQuotaUsageInfo,
  IUserRole,
  IUserRoleType,
} from '@/features/auth/types'
import maxAIClientSafeFetch from '@/utils/maxAIClientSafeFetch'
import { backgroundSendMaxAINotification } from '@/utils/sendMaxAINotification/background'

export const getMaxAIChromeExtensionAccessToken = async (): Promise<string> => {
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
      const cacheRoleData = cloneDeep(userData?.role || {})
      let isUpdated = false
      if (!userData || forceUpdate) {
        userData = await fetchUserInfo()
        userData.role = cacheRoleData
        isUpdated = true
      }
      if (forceUpdate || !userData?.role?.name) {
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
/**
 * 获取 网页客户端生成 的 user id
 */
export const getMaxAIWebSiteClientUserId = async (): Promise<string> => {
  const cache = await Browser.storage.local.get(
    CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  )
  if (cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]) {
    const cacheData =
      cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
    // userinfo 接口返回的 client_user_id 优先级更高
    return (cacheData?.userData?.client_user_id ??
      cacheData?.clientUserId) as string
  }
  return ''
}
/**
 * 获取用户Email
 */
export const getMaxAIChromeExtensionEmail = async (): Promise<string> => {
  const cache = await Browser.storage.local.get(
    CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  )
  if (cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]) {
    return cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
      ?.userData?.email as string
  }
  return ''
}

/**
 * 获取用户 quota 使用量
 */
export const getMaxAIChromeExtensionUserQuotaUsage = async (
  forceUpdate: boolean,
): Promise<IUserQuotaUsageInfo | undefined> => {
  try {
    const cache = await Browser.storage.local.get(
      CHROME_EXTENSION_LOCAL_STORAGE_USER_QUOTA_USAGE_SAVE_KEY,
    )
    if (cache[CHROME_EXTENSION_LOCAL_STORAGE_USER_QUOTA_USAGE_SAVE_KEY]) {
      // 如果有缓存数据，根据 forceUpdate 判断需不需要重新fetch
      // 或者直接返回缓存数据
      let cacheData = cloneDeep(
        cache[CHROME_EXTENSION_LOCAL_STORAGE_USER_QUOTA_USAGE_SAVE_KEY],
      )
      let isUpdated = false
      if (forceUpdate) {
        cacheData = await fetchUserQuotaUsageInfo()
        isUpdated = !!cacheData
      }
      if (isUpdated) {
        await Browser.storage.local.set({
          [CHROME_EXTENSION_LOCAL_STORAGE_USER_QUOTA_USAGE_SAVE_KEY]: {
            ...cache[CHROME_EXTENSION_LOCAL_STORAGE_USER_QUOTA_USAGE_SAVE_KEY],
            ...cacheData,
          },
        })
      }
      return cacheData
    } else {
      // 如果没有缓存数据，直接fetch
      const quotaUsageResponseData = await fetchUserQuotaUsageInfo()
      await Browser.storage.local.set({
        [CHROME_EXTENSION_LOCAL_STORAGE_USER_QUOTA_USAGE_SAVE_KEY]:
          quotaUsageResponseData,
      })
      return quotaUsageResponseData
    }
  } catch (error) {
    return undefined
  }
}

// 这么写主要是为了防止重复请求，因为现在多个app focus会调用此方法，此方法会重复请求
let fetchUserFeatureQuotaPromise: Promise<IUserFeatureQuotaInfo> | null = null
/**
 * 获取用户 feature quota 使用量以及每日上限
 * @param forceUpdate
 */
export const getMaxAIChromeExtensionUserFeatureQuota = async (
  forceUpdate?: boolean,
): Promise<IUserFeatureQuotaInfo> => {
  return new Promise((resolve) => {
    if (!fetchUserFeatureQuotaPromise) {
      fetchUserFeatureQuotaPromise = new Promise<IUserFeatureQuotaInfo>(
        // eslint-disable-next-line no-async-promise-executor
        async (resolve) => {
          const userFeatureQuotaInfo: IUserFeatureQuotaInfo = {
            summarizePageMaxCnt: 0,
            summarizePDFMaxCnt: 0,
            summarizeYoutubeMaxCnt: 0,
            contextMenuMaxCnt: 100,
            searchMaxCnt: 0,
            instantReplyMaxCnt: 0,
            checkTime: '',
            refreshTime: '',
            summarizePageUsage: 0,
            summarizePDFUsage: 0,
            summarizeYoutubeUsage: 0,
            contextMenuUsage: 0,
            searchUsage: 0,
            instantReplyUsage: 0,
          }
          try {
            const cache = await Browser.storage.local.get(
              CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY,
            )
            if (
              cache[CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY]
            ) {
              Object.assign(
                userFeatureQuotaInfo,
                cache[
                  CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY
                ],
              )
              let isUpdated = false
              if (
                forceUpdate ||
                !userFeatureQuotaInfo.checkTime ||
                !dayjs().isSame(dayjs(userFeatureQuotaInfo.checkTime), 'day')
              ) {
                const responseData = await fetchUserFeatureQuotaInfo()
                Object.assign(userFeatureQuotaInfo, responseData)
                isUpdated = !!responseData
              }
              if (isUpdated) {
                await Browser.storage.local.set({
                  [CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY]:
                    {
                      ...cache[
                        CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY
                      ],
                      ...userFeatureQuotaInfo,
                    },
                })
              }
            } else {
              // 如果没有缓存数据，直接fetch
              const responseData = await fetchUserFeatureQuotaInfo()
              Object.assign(userFeatureQuotaInfo, responseData)
              await Browser.storage.local.set({
                [CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY]:
                  userFeatureQuotaInfo,
              })
            }
          } catch (error) {
            console.error(error)
          }
          // 每日刷新用量
          if (
            !userFeatureQuotaInfo.refreshTime ||
            !dayjs().isSame(dayjs(userFeatureQuotaInfo.refreshTime), 'day')
          ) {
            Object.assign(userFeatureQuotaInfo, {
              refreshTime: new Date().toISOString(),
              summarizePageUsage: 0,
              summarizePDFUsage: 0,
              summarizeYoutubeUsage: 0,
              contextMenuUsage: 0,
              searchUsage: 0,
              instantReplyUsage: 0,
            })
            await Browser.storage.local.set({
              [CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY]:
                userFeatureQuotaInfo,
            })
          }
          resolve(userFeatureQuotaInfo)
        },
      ).finally(() => {
        fetchUserFeatureQuotaPromise = null
      })
    }
    fetchUserFeatureQuotaPromise.then((result) => {
      resolve(result)
      return result
    })
  })
}

/**
 * 修改用户 feature quota 每日用量
 * @param key
 * @param value
 */
export const setMaxAIChromeExtensionUserFeatureUsage = async (
  key: keyof IUserFeatureQuotaInfo,
  value: number | string,
) => {
  const data = await getMaxAIChromeExtensionUserFeatureQuota(false)
  await Browser.storage.local.set({
    [CHROME_EXTENSION_LOCAL_STORAGE_USER_FEATURE_QUOTA_SAVE_KEY]: {
      ...data,
      [key]: value,
    },
  })
}

/**
 * 获取当前用户所在的tab的url
 */
export const getCurrentFocusTabUrl = async () => {
  const currentFocusTabs = await Browser.tabs.query({
    active: true,
    currentWindow: true,
  })
  const currentTabUrl = currentFocusTabs[0]?.url || ''
  let focusUrl = ''
  try {
    // 确保是合法的url
    if (currentTabUrl && new URL(currentTabUrl)) {
      focusUrl = currentTabUrl
    }
  } catch (e) {
    // do nothing
  }
  if (!focusUrl) {
    focusUrl = Browser.runtime.getURL('/pages/settings/index.html')
  }
  return focusUrl
}

export const fetchUserSubscriptionInfo = async (): Promise<
  IUserRole | undefined
> => {
  try {
    const token = await getMaxAIChromeExtensionAccessToken()
    if (!token) {
      return undefined
    }
    const response = await maxAIClientSafeFetch(
      `${APP_USE_CHAT_GPT_API_HOST}/user/get_user_subscription_info`,
      {},
      await getCurrentFocusTabUrl(),
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
          let role =
            result.data.roles.find((role: { name: string; exp_time: number }) =>
              checkIsPayingUser(role?.name as IUserRoleType),
            ) || result.data.roles[0]
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
            backgroundSendMaxAINotification(
              'PRICING',
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
            backgroundSendMaxAINotification(
              'MAXAI_API',
              '[API] error response roles',
              `Pro token [${token}]\n${JSON.stringify(result?.data)}`,
              {
                uuid: '6f02f533-def6-4696-b14e-1b00c2d9a4df',
              },
            )
          }
          if (role.name === 'elite' && result.data.has_reached_limit) {
            backgroundSendMaxAINotification(
              'PRICING',
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
            backgroundSendMaxAINotification(
              'MAXAI_API',
              '[API] error response roles',
              `Elite token [${token}]\n${JSON.stringify(result?.data)}`,
              {
                uuid: '6f02f533-def6-4696-b14e-1b00c2d9a4df',
              },
            )
          }
          // subscription_plan_name 直接使用 get_user_subscription_info 接口返回的数据
          let subscription_plan_name = result?.data
            ?.subscription_plan_name as IUserPlanNameType

          const cache = await Browser.storage.local.get(
            CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
          )
          if (
            subscription_plan_name === 'UNKNOWN' &&
            cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
          ) {
            const userData =
              cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
                ?.userData
            if (userData?.subscription_plan_name) {
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
    const token = await getMaxAIChromeExtensionAccessToken()
    if (!token) {
      return undefined
    }
    const response = await maxAIClientSafeFetch(
      `${APP_USE_CHAT_GPT_API_HOST}/user/get_user_info`,
      {},
      await getCurrentFocusTabUrl(),
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

// 获取用户 各个模型的 quota 用量查询
export const fetchUserQuotaUsageInfo = async (): Promise<
  IUserQuotaUsageInfo | undefined
> => {
  try {
    const token = await getMaxAIChromeExtensionAccessToken()
    if (!token) {
      return undefined
    }
    const response = await maxAIClientSafeFetch(
      `${APP_USE_CHAT_GPT_API_HOST}/user/get_user_quota_usage`,
      {},
    )
    if (response.ok) {
      const result = await response.json()
      if (result.status === 'OK' && result?.msg === 'success') {
        const data = result.data
        return {
          fastText: data.fast_text,
          advancedText: data.advanced_text,
          imageGenerate: data.image_generate,
          nextRefreshTime: data.next_refresh_time,
        } as IUserQuotaUsageInfo
      }
    }
    return undefined
  } catch (e) {
    return undefined
  }
}

/**
 * 获取用户 各个功能的每日quota使用上限
 */
export const fetchUserFeatureQuotaInfo = async (): Promise<
  Partial<IUserFeatureQuotaInfo> | undefined
> => {
  try {
    const token = await getMaxAIChromeExtensionAccessToken()
    if (!token) {
      return undefined
    }
    const response = await maxAIClientSafeFetch(
      `${APP_USE_CHAT_GPT_API_HOST}/user/get_user_feature_quota`,
      {},
    )
    if (response.ok) {
      const result = await response.json()
      if (result.status === 'OK' && result?.msg === 'success') {
        const data = result.data
        return {
          summarizePageMaxCnt: data.SUMMARIZE_PAGE_REQUEST_MAX_CNT,
          summarizePDFMaxCnt: data.SUMMARIZE_PDF_REQUEST_MAX_CNT,
          summarizeYoutubeMaxCnt: data.SUMMARIZE_YOUTUBE_VIDEO_REQUEST_MAX_CNT,
          contextMenuMaxCnt: data.CONTEXT_MENU_REQUEST_MAX_CNT,
          searchMaxCnt: data.SEARCH_REQUEST_MAX_CNT,
          instantReplyMaxCnt: data.INSTANT_REPLY_REQUEST_MAX_CNT,
          checkTime: new Date().toISOString(),
        }
      }
    }
    return undefined
  } catch (e) {
    return undefined
  }
}

export const checkIsPayingUser = (
  userRoleName: IUserRoleType | null | undefined,
): boolean => {
  return userRoleName ? PAYING_USER_ROLE_NAME.includes(userRoleName) : false
}

export const getCurrentUserLogInfo = async () => {
  const userInfo = await getChromeExtensionUserInfo(false)

  // guest 代表未登录的用户
  const currentRole = userInfo?.role?.name ?? 'guest'
  let currentPlan = userInfo?.role?.subscription_plan_name ?? 'GUEST' // 由于后端返回的值都是大写的，这里统一大写
  const freeTrialVersion = userInfo?.user_status?.register_version ?? ''

  // 但是当用户为 free 时，后端返回的 subscription_plan_name 为 null
  // 所以这里需要处理，currentPlan === 'GUEST' && currentRole === 'free' 的情况
  if (
    currentPlan === 'GUEST' &&
    (currentRole?.startsWith('free') ||
      currentRole === 'new_user' ||
      currentRole === 'pro_gift')
  ) {
    currentPlan = 'FREE'
  }

  return {
    currentPlan,
    currentRole,
    freeTrialVersion,
  }
}

export const checkIsSubscriptionPaymentFailed = (
  subscriptionPaymentFailedAt?: IUseChatGPTUserInfo['subscription_payment_failed_at'],
) => {
  // subscription_payment_failed_at是空值，不显示续费失败提示
  if (!subscriptionPaymentFailedAt) {
    return false
  }
  // 判断是否显示续费失败提示
  // 当前时间距离subscription_payment_failed_at小于等于30天
  const failedAt = dayjs(subscriptionPaymentFailedAt * 1000)
  const diffDays = dayjs().utc().diff(failedAt, 'day')
  return diffDays <= 30
}
