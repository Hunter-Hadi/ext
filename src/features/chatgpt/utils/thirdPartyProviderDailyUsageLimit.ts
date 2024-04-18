import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import Browser from 'webextension-polyfill'

import {
  checkIsPayingUser,
  getChromeExtensionUserInfo,
} from '@/features/auth/utils'
dayjs.extend(utc)

interface IThirdPartyUsageLimitDataType {
  hasReachedLimit: boolean
  nextResetTimestamp: number
  usage: number
}

const CHROME_EXTENSION_THIRD_PART_LOG_DAILY_USAGE_LIMIT_KEY =
  'CHROME_EXTENSION_THIRD_PART_LOG_DAILY_USAGE_LIMIT_KEY'

// 前端定义第三方 provider 的每日使用上限
export const THIRD_PARTY_USAGE_LIMIT = 30

const DEFAULT_THIRD_PARTY_USAGE_LIMIT_DATA = {
  hasReachedLimit: false,
  nextResetTimestamp: getTomorrowMidnightTimestamp(), // utc 时间明天的0点
  usage: 0,
}

/**
 * 记录 第三方 provider 使用次数
 * 暂时只记录第三方AI的使用次数, 不管使用场景
 *
 * @return {boolean} 是否已经达到上限
 */
export const logThirdPartyDailyUsage =
  async (): Promise<IThirdPartyUsageLimitDataType> => {
    try {
      const data = await getThirdPartyDailyUsageLimitData()
      // 根据 nextResetTimestamp 和 nowTimestamp 判断是否到达刷新时间
      const nowTimestamp = dayjs().utc().valueOf()
      if (nowTimestamp >= data.nextResetTimestamp) {
        // 到达刷新时间，更新数据
        data.nextResetTimestamp = getTomorrowMidnightTimestamp()
        data.usage = 0
        data.hasReachedLimit = false
        return data
      }

      data.usage += 1
      if (data.usage >= THIRD_PARTY_USAGE_LIMIT) {
        data.hasReachedLimit = true

        const userInfo = await getChromeExtensionUserInfo(false)
        if (checkIsPayingUser(userInfo?.role?.name)) {
          // 如果是付费用户，不限制使用次数
          data.hasReachedLimit = false
        }
      }
      await setThirdPartyDailyUsageLimitData(data)
      return data
    } catch (e) {
      console.log(e)
      return DEFAULT_THIRD_PARTY_USAGE_LIMIT_DATA
    }
  }

/**
 * 判断 第三方 provider 是否已经达到每日使用上限
 *
 * @return {boolean} 是否已经达到上限
 */
export const confirmThirdPartyDailyUsageLimit = async (): Promise<boolean> => {
  try {
    const data = await getThirdPartyDailyUsageLimitData()
    return data.hasReachedLimit
  } catch (e) {
    console.log(e)
    return false
  }
}

/**
 * 更新缓存 第三方 provider 每日使用上限
 * @param data
 */
export const setThirdPartyDailyUsageLimitData = async (
  data: IThirdPartyUsageLimitDataType,
): Promise<void> => {
  try {
    await Browser.storage.local.set({
      [CHROME_EXTENSION_THIRD_PART_LOG_DAILY_USAGE_LIMIT_KEY]:
        JSON.stringify(data),
    })
  } catch (e) {
    console.log(e)
  }
}

/**
 * 获取缓存中 第三方 provider 每日使用上限
 */
export const getThirdPartyDailyUsageLimitData =
  async (): Promise<IThirdPartyUsageLimitDataType> => {
    try {
      const cache = await Browser.storage.local.get(
        CHROME_EXTENSION_THIRD_PART_LOG_DAILY_USAGE_LIMIT_KEY,
      )
      if (cache[CHROME_EXTENSION_THIRD_PART_LOG_DAILY_USAGE_LIMIT_KEY]) {
        const data = JSON.parse(
          cache[CHROME_EXTENSION_THIRD_PART_LOG_DAILY_USAGE_LIMIT_KEY],
        )
        return {
          hasReachedLimit: data.hasReachedLimit,
          nextResetTimestamp: data.nextResetTimestamp,
          usage: data.usage,
        }
      }
      return DEFAULT_THIRD_PARTY_USAGE_LIMIT_DATA
    } catch (e) {
      console.log(e)
      return DEFAULT_THIRD_PARTY_USAGE_LIMIT_DATA
    }
  }

// 获取 utc 时间明天的0点
export function getTomorrowMidnightTimestamp(): number {
  // 获取当前 UTC 时间
  const nowUTC = dayjs().utc()

  // 获取明天0点的 UTC 时间
  const tomorrowMidnightUTC = nowUTC.add(1, 'day').startOf('day')

  // 获取明天0点的 UTC 时间戳
  const timestamp = tomorrowMidnightUTC.valueOf()

  return timestamp
}
