import Browser from 'webextension-polyfill'

import { isProduction } from '@/constants'
import { IPaymentMethod, RENDER_PLAN_TYPE } from '@/features/pricing/type'

type IStripeLinksCacheType = {
  [key: string]: {
    link: string
    expiredTime: string
  }
}

const CHROME_EXTENSION_CACHE_STRIPE_LINK_KEY =
  'CHROME_EXTENSION_CACHE_STRIPE_LINK'

const defaultStripeLinkCache: IStripeLinksCacheType = {}

export const STRIPE_LINK_CACHE_PERIOD = isProduction
  ? 1000 * 60 * 60 * 6 // 6 小时后 过期
  : 1000 * 60 * 5 // 测试环境 5min后 过期

// 根据 plan, coupon, paymentMethod 生成 cache key
export const generateCheckoutCacheKey = (
  plan: RENDER_PLAN_TYPE,
  coupon: string,
  paymentMethod: IPaymentMethod[] = [],
) => {
  return `${plan}-${coupon}-${paymentMethod.join('-')}`
}

export const getAllStripeLinksCacheData =
  async (): Promise<IStripeLinksCacheType> => {
    const localData = await Browser.storage.local.get(
      CHROME_EXTENSION_CACHE_STRIPE_LINK_KEY,
    )
    try {
      const cacheData = localData[CHROME_EXTENSION_CACHE_STRIPE_LINK_KEY]
      return cacheData ? JSON.parse(cacheData) : defaultStripeLinkCache
    } catch (e) {
      return defaultStripeLinkCache
    }
  }

export const getStripeLinkCache = async (
  plan: RENDER_PLAN_TYPE,
  couponCode = '',
  paymentMethod: IPaymentMethod[] = [],
): Promise<string | null> => {
  const allStripeLinkCacheData = await getAllStripeLinksCacheData()
  try {
    const cacheKey = generateCheckoutCacheKey(plan, couponCode, paymentMethod)
    const cacheData = allStripeLinkCacheData[cacheKey]
    const now = new Date().getTime()
    if (cacheData && Number(cacheData.expiredTime) > now) {
      return cacheData.link
    } else {
      return null
    }
  } catch (e) {
    return null
  }
}

export const setStripeLinkCache = async (
  stripeLink: string,
  plan: RENDER_PLAN_TYPE,
  couponCode = '',
  paymentMethod: IPaymentMethod[] = [],
) => {
  try {
    const cacheKey = generateCheckoutCacheKey(plan, couponCode, paymentMethod)
    const now = new Date().getTime()
    const expiredTime = now + STRIPE_LINK_CACHE_PERIOD
    const newData = {
      link: stripeLink,
      expiredTime: expiredTime.toString(),
    }
    const oldCacheData = await getAllStripeLinksCacheData()
    const newCacheData = {
      ...oldCacheData,
      [cacheKey]: newData,
    }
    await Browser.storage.local.set({
      [CHROME_EXTENSION_CACHE_STRIPE_LINK_KEY]: JSON.stringify(newCacheData),
    })
    return true
  } catch (e) {
    return false
  }
}
