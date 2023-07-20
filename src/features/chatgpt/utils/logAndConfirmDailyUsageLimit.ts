import { getChromeExtensionSettings } from '@/background/utils'
import { getAccessToken } from '@/utils/request'
import AES from 'crypto-js/aes'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { getFingerPrint } from '@/utils/fingerPrint'
import Browser from 'webextension-polyfill'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { getChromeExtensionUserInfo } from '@/features/auth/utils'
import {
  contextMenuIsFavoriteContextMenu,
  FAVORITE_CONTEXT_MENU_GROUP_ID,
} from '@/features/contextMenu/hooks/useFavoriteContextMenuList'
import { sendLarkBotMessage } from '@/utils/larkBot'
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
}): Promise<boolean> => {
  const logApiAndConfirmIsLimited = async () => {
    try {
      const settings = await getChromeExtensionSettings()
      const provider = settings.chatGPTProvider || 'UNKNOWN_PROVIDER'
      const info_object = {
        ai_provider: provider,
        domain: promptDetail.host,
        prompt_id: promptDetail.id,
        prompt_name: promptDetail.name,
      }
      if (contextMenuIsFavoriteContextMenu(info_object.prompt_id)) {
        info_object.prompt_id =
          FAVORITE_CONTEXT_MENU_GROUP_ID +
          info_object.prompt_id.slice(FAVORITE_CONTEXT_MENU_GROUP_ID.length + 8)
        info_object.prompt_name = `[Suggested] ${info_object.prompt_name}`
      }
      console.log('logApiAndConfirmIsLimited', info_object)
      const accessToken = await getAccessToken()
      const fingerprint = await getFingerPrint()
      const text = AES.encrypt(JSON.stringify(info_object), 'MaxAI').toString()
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
      console.log(body)
      // has_reached_limit:false
      // next_reset_timestamp:1688515200
      if (body.data && body.status === 'OK') {
        console.log('logApiAndConfirmIsLimited api result', body.data)
        // save to local storage
        await Browser.storage.local.set({
          [CHROME_EXTENSION_LOG_DAILY_USAGE_LIMIT_KEY]: JSON.stringify(
            body.data,
          ),
        })
        // 更新用户的SubscriptionInfo
        if (body.data.has_reached_limit) {
          getChromeExtensionUserInfo(true).then().catch()
        }
        // 如果没有达到限制，就返回true
        return body.data.has_reached_limit
      }
      return false
    } catch (e) {
      console.log('logApiAndConfirmIsLimited error', e)
      return false
    }
  }
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    try {
      const cache = await getDailyUsageLimitData()
      if (cache) {
        // 说明没有达到限制，可以继续调用
        if (!cache.has_reached_limit) {
          logApiAndConfirmIsLimited().then().catch()
          resolve(false)
        } else {
          // TODO 校验身份 pro不拦截，但是发larkbot
          // 说明达到限制了
          const userInfo = await getChromeExtensionUserInfo(false)
          if (userInfo?.role?.name === 'pro') {
            // pro用户不拦截
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
          }
          resolve(true)
          // // 调用userSubscription api更新缓存
          // await fetchUserSubscriptionInfo()
          // cache = await getDailyUsageLimitData()
          // if (cache.has_reached_limit) {
          //   // 说明还是达到限制了
          //   resolve(true)
          //   return
          // }
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
