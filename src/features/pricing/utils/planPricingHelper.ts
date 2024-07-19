import dayjs from 'dayjs'
import cloneDeep from 'lodash-es/cloneDeep'
import mergeWith from 'lodash-es/mergeWith'
import Browser from 'webextension-polyfill'

import { CHROME_EXTENSION_LOCAL_STORAGE_PLAN_PRICING_SAVE_KEY } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { PLAN_PRICING_MAP } from '@/features/pricing/constants'
import { IPlanPricingInfo, RENDER_PLAN_TYPE } from '@/features/pricing/type'
import { aesJsonDecrypt } from '@/features/security'
import { clientMaxAIGet } from '@/utils/request'

// 这么写主要是为了防止重复请求，因为现在多个app focus会调用此方法，此方法会重复请求
let fetchPlanPricingInfoPromise: Promise<
  Record<RENDER_PLAN_TYPE, IPlanPricingInfo>
> | null = null
/**
 * 获取plan pricing信息
 * 1. 从缓存中读取数据
 * 2. 判断更新时间是否重新fetch（24小时）
 * @param forceUpdate
 */
export const getChromeExtensionPlanPricingInfo = async (
  forceUpdate?: boolean,
): Promise<Record<RENDER_PLAN_TYPE, IPlanPricingInfo>> => {
  return new Promise((resolve) => {
    if (!fetchPlanPricingInfoPromise) {
      fetchPlanPricingInfoPromise = new Promise<
        Record<RENDER_PLAN_TYPE, IPlanPricingInfo>
        // eslint-disable-next-line no-async-promise-executor
      >(async (resolve) => {
        let planPricingInfo = { ...cloneDeep(PLAN_PRICING_MAP), fetchTime: '' }
        try {
          const cache = await Browser.storage.local.get(
            CHROME_EXTENSION_LOCAL_STORAGE_PLAN_PRICING_SAVE_KEY,
          )
          if (cache[CHROME_EXTENSION_LOCAL_STORAGE_PLAN_PRICING_SAVE_KEY]) {
            planPricingInfo = mergeWith(
              planPricingInfo,
              cache[CHROME_EXTENSION_LOCAL_STORAGE_PLAN_PRICING_SAVE_KEY],
            )
          }
          // 重新获取pricing数据, 10分钟获取一次
          if (forceUpdate !== false) {
            if (
              forceUpdate ||
              !planPricingInfo.fetchTime ||
              !dayjs().isSame(dayjs(planPricingInfo.fetchTime), 'day')
            ) {
              const fetchData = await fetchPlanPricingInfo()
              if (fetchData) {
                planPricingInfo = mergeWith(planPricingInfo, fetchData, {
                  fetchTime: new Date().toISOString(),
                })
                await Browser.storage.local.set({
                  [CHROME_EXTENSION_LOCAL_STORAGE_PLAN_PRICING_SAVE_KEY]:
                    planPricingInfo,
                })
              }
            }
          }
        } catch (error) {
          console.error(error)
        }
        delete (planPricingInfo as any).fetchTime
        resolve(planPricingInfo)
      }).finally(() => {
        fetchPlanPricingInfoPromise = null
      })
    }
    fetchPlanPricingInfoPromise.then((result) => {
      resolve(result)
      return result
    })
  })
}

/**
 * 重置plan pricing info的fetchTime
 */
export const resetChromeExtensionPlanPricingInfo = async () => {
  const data = await getChromeExtensionPlanPricingInfo(false)
  await Browser.storage.local.set({
    [CHROME_EXTENSION_LOCAL_STORAGE_PLAN_PRICING_SAVE_KEY]: {
      ...data,
      fetchTime: '',
    },
  })
}

export const fetchPlanPricingInfo = async (): Promise<Record<
  RENDER_PLAN_TYPE,
  IPlanPricingInfo
> | null> => {
  try {
    const token = await getMaxAIChromeExtensionAccessToken()
    if (!token) {
      return null
    }
    const result = await clientMaxAIGet<string>('/app/get_subscription_pricing')
    if (result?.data) {
      const data = aesJsonDecrypt(result.data)
      // 目前RENDER_PLAN_TYPE里monthly的类型是没这个内容，先去掉
      Object.keys(data).forEach((key) => {
        if (key.includes('monthly')) {
          data[`${key.replace('_monthly', '')}`] = data[key]
          delete data[key]
        }
      })
      return data
    }
    return null
  } catch (e) {
    return null
  }
}
