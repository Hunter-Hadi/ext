import AES from 'crypto-js/aes'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Browser from 'webextension-polyfill'

import { IAIProviderType } from '@/background/provider/chat'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { APP_USE_CHAT_GPT_API_HOST, APP_VERSION } from '@/constants'
import {
  fetchUserSubscriptionInfo,
  getChromeExtensionUserInfo,
} from '@/features/auth/utils'
import {
  contextMenuIsFavoriteContextMenu,
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { getFingerPrint } from '@/utils/fingerPrint'
import { getBrowserInfo, sendLarkBotMessage } from '@/utils/larkBot'
import { getAccessToken } from '@/utils/request'
dayjs.extend(utc)

export const CHROME_EXTENSION_LOG_DAILY_USAGE_LIMIT_KEY =
  'CHROME_EXTENSION_LOG_DAILY_USAGE_LIMIT_KEY'
/**
 * 记录用户发送chat的次数情况
 * @param promptDetail
 */
export const logAndConfirmDailyUsageLimit = async (promptDetail: {
  id: string
  name: string
  host: string
  provider?: IAIProviderType
}): Promise<boolean> => {
  const logApiAndConfirmIsLimited = async () => {
    try {
      const appLocalStorage = await getChromeExtensionLocalStorage()
      const provider =
        promptDetail.provider ||
        appLocalStorage.sidebarSettings?.common?.currentAIProvider ||
        'UNKNOWN_PROVIDER'
      const beautyQueryMap: {
        [key in IAIProviderType]: string
      } = {
        USE_CHAT_GPT_PLUS: 'chatgpt',
        OPENAI: 'chatgpt_web_app',
        OPENAI_API: 'openai_api',
        BARD: 'bard_web_app',
        BING: 'bing_web_app',
        POE: 'poe',
        CLAUDE: 'claude_web_app',
        MAXAI_CLAUDE: 'claude',
        MAXAI_GEMINI: 'gemini',
        MAXAI_ART: 'maxai_art',
      }
      const info_object = {
        ai_provider:
          beautyQueryMap[provider as IAIProviderType] || 'UNKNOWN_PROVIDER',
        domain: promptDetail.host,
        prompt_id: promptDetail.id,
        prompt_name: promptDetail.name,
        browser: await getBrowserInfo(),
        app_version: APP_VERSION,
      }
      if (contextMenuIsFavoriteContextMenu(info_object.prompt_id)) {
        info_object.prompt_id =
          FAVORITE_CONTEXT_MENU_GROUP_ID +
          info_object.prompt_id.slice(FAVORITE_CONTEXT_MENU_GROUP_ID.length + 8)
        info_object.prompt_name = `[Suggested] ${info_object.prompt_name}`
      }
      console.log('[CALL_API] logApiAndConfirmIsLimited', info_object)
      const accessToken = await getAccessToken()
      const fingerprint = await getFingerPrint()
      const text = AES.encrypt(JSON.stringify(info_object), 'MaxAI').toString()
      if (!accessToken) {
        return false
      }
      const result = await fetch(`${APP_USE_CHAT_GPT_API_HOST}/user/call_api`, {
        method: 'POST',
        body: JSON.stringify({
          info_object: text,
        }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
          fp: `${fingerprint}`,
        },
      })
      const body = await result.json()
      // has_reached_limit:false
      // next_reset_timestamp:1688515200
      if (body.data && body.status === 'OK') {
        console.log('logApiAndConfirmIsLimited api result', body.data)
        // 更新本地的缓存
        await setDailyUsageLimitData(body.data)
        // 更新用户的SubscriptionInfo
        if (body.data.has_reached_limit) {
          getChromeExtensionUserInfo(true).then().catch()
        }
        // 如果没有达到限制，就返回false
        return body.data.has_reached_limit
      }
      return false
    } catch (e) {
      if ((e as any)?.message === 'Failed to fetch') {
        const subscriptionInfo = await fetchUserSubscriptionInfo()
        if (subscriptionInfo?.name === 'free') {
          // 说明请求被恶意拦截了
          const cache = await getDailyUsageLimitData()
          cache.has_reached_limit = true
          await setDailyUsageLimitData(cache)
          return true
        }
      }
      console.log('logApiAndConfirmIsLimited error', e)
      return false
    }
  }
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    try {
      let cache = await getDailyUsageLimitData()
      if (cache) {
        // 说明没有达到限制，可以继续调用
        if (!cache.has_reached_limit) {
          logApiAndConfirmIsLimited().then().catch()
          resolve(false)
        } else {
          // 说明达到限制了
          // TODO 校验身份 pro不拦截，但是发larkbot
          const userInfo = await getChromeExtensionUserInfo(false)
          if (
            userInfo?.role?.name === 'pro' ||
            userInfo?.role?.name === 'elite'
          ) {
            // pro用户没过期, 不拦截
            if (
              userInfo.role.exp_time &&
              dayjs(userInfo.role.exp_time).diff(dayjs().utc()) > 0
            ) {
              sendLarkBotMessage(
                `[Pricing] Pro [cache] has reached the limit`,
                `Pro user ${
                  userInfo?.email
                } use has reached the limit.\n${JSON.stringify({
                  role: userInfo?.role,
                  usage: cache.usage,
                })}`,
                {
                  uuid: '7a04bc02-6155-4253-bcdb-ade3db6de492',
                },
              )
              resolve(false)
              return
            } else {
              // pro 用户过期了，就拦截
              await fetchUserSubscriptionInfo()
              // 更新本地的缓存
              cache = await getDailyUsageLimitData()
              resolve(cache.has_reached_limit)
            }
          }
          // 已经到达了限制，但是普通用户刷新时间到了，就更新
          if (new Date() > new Date(cache.next_reset_timestamp * 1000)) {
            await fetchUserSubscriptionInfo()
            cache = await getDailyUsageLimitData()
            resolve(cache.has_reached_limit)
            return
          }
          // 普通用户，到达了限制，但是还没有到刷新时间，就不更新
          resolve(true)
        }
      } else {
        // 理论上不可能走到这里
        const result = await logApiAndConfirmIsLimited()
        resolve(result)
      }
    } catch (e) {
      // 其实不应该返回可以调用，但是接口应该可以正确的处理
      resolve(false)
    }
  })
}

/**
 * 更新本地每日使用上限
 * @param data
 */
export const setDailyUsageLimitData = async (data: {
  has_reached_limit: boolean
  next_reset_timestamp: number
  usage: number
  limit_value: number
}): Promise<void> => {
  try {
    console.log('logApiAndConfirmIsLimited update cache', data)
    await Browser.storage.local.set({
      [CHROME_EXTENSION_LOG_DAILY_USAGE_LIMIT_KEY]: JSON.stringify(data),
    })
  } catch (e) {
    console.log(e)
  }
}

/**
 * 获取本地每日使用上限
 */
export const getDailyUsageLimitData = async (): Promise<{
  has_reached_limit: boolean
  next_reset_timestamp: number
  usage: number
  limit_value: number
}> => {
  try {
    const cache = await Browser.storage.local.get(
      CHROME_EXTENSION_LOG_DAILY_USAGE_LIMIT_KEY,
    )
    if (cache[CHROME_EXTENSION_LOG_DAILY_USAGE_LIMIT_KEY]) {
      const data = JSON.parse(cache[CHROME_EXTENSION_LOG_DAILY_USAGE_LIMIT_KEY])
      return {
        has_reached_limit: data.has_reached_limit,
        next_reset_timestamp: data.next_reset_timestamp,
        usage: data.usage,
        limit_value: data.limit_value,
      }
    }
    return {
      has_reached_limit: false,
      next_reset_timestamp: 0,
      usage: 0,
      limit_value: 0,
    }
  } catch (e) {
    console.log(e)
    return {
      has_reached_limit: false,
      next_reset_timestamp: 0,
      usage: 0,
      limit_value: 0,
    }
  }
}
