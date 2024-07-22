import isNumber from 'lodash-es/isNumber'
import { useCallback, useEffect, useMemo } from 'react'
import { useRecoilState } from 'recoil'

import { isProdAPI } from '@/constants'
import { useFocus } from '@/features/common/hooks/useFocus'
import { PlanPricingInfoAtom } from '@/features/pricing/store'
import { IPlanPricingInfo, RENDER_PLAN_TYPE } from '@/features/pricing/type'
import { getChromeExtensionPlanPricingInfo } from '@/features/pricing/utils/planPricingHelper'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

const isBetterDiscount = (
  prev: IPlanPricingInfo | null,
  current: IPlanPricingInfo,
) => {
  if (isNumber(current.discount_value)) {
    // discount_title存储的是相对于月付的折扣百分比标题
    // 这里直接对比这个即可
    if (prev?.discount_title) {
      return (
        parseInt(current.discount_title || '') > parseInt(prev.discount_title)
      )
    }
    // if (isNumber(prev?.discount_value)) {
    //   return current.discount_value < prev!.discount_value
    // }
    return true
  }
  return false
}

// 目前pricing modal和upgrade不在同一个provider下
// 这里先简单存储一下
let cacheData: Record<string, any> = {}

const usePlanPricingInfo = (init?: boolean) => {
  const [planPricingInfo, setPlanPricingInfo] =
    useRecoilState(PlanPricingInfoAtom)

  // 注意接口里的elite_monthly要转换为elite，前端目前monthly的类型没有后缀
  const fetchPlanPricing = useCallback(async (forceUpdate?: boolean) => {
    setPlanPricingInfo((prev) => ({
      ...prev,
      loading: true,
    }))
    try {
      const data = await getChromeExtensionPlanPricingInfo(forceUpdate)
      cacheData = data
      setPlanPricingInfo((prev) => {
        return {
          ...prev,
          loading: false,
          data,
        }
      })
    } catch (err) {
      console.error(err)
      setPlanPricingInfo((prev) => ({
        ...prev,
        loading: false,
      }))
    }
  }, [])

  useEffect(() => {
    if (init) {
      fetchPlanPricing()
    }
  }, [])

  useFocus(() => {
    if (init) {
      fetchPlanPricing()
    }
  })

  // 最高折扣
  const maxDiscountInfo = useMemo(() => {
    let maxDiscount: IPlanPricingInfo | null = null
    let maxYearlyDiscount: IPlanPricingInfo | null = null
    let maxMonthlyDiscount: IPlanPricingInfo | null = null
    Object.values(planPricingInfo.data).forEach((item) => {
      if (isBetterDiscount(maxDiscount, item)) {
        maxDiscount = item
      }
      if (item.type.includes('yearly')) {
        if (isBetterDiscount(maxYearlyDiscount, item)) {
          maxYearlyDiscount = item
        }
      }
      if (!item.type.includes('_')) {
        if (isBetterDiscount(maxMonthlyDiscount, item)) {
          maxMonthlyDiscount = item
        }
      }
    })
    if (isBetterDiscount(maxDiscount, planPricingInfo.data.elite_yearly)) {
      maxDiscount = planPricingInfo.data.elite_yearly
    }

    // 下面不这么写推导出得类型全是null?
    return { maxDiscount, maxYearlyDiscount, maxMonthlyDiscount } as {
      maxDiscount: IPlanPricingInfo | null
      maxYearlyDiscount: IPlanPricingInfo | null
      maxMonthlyDiscount: IPlanPricingInfo | null
    }
  }, [planPricingInfo.data])

  const pricingInfoData = useMemo(() => {
    const mergeInfo = mergeWithObject([planPricingInfo.data, cacheData])
    return (Object.keys(mergeInfo) as RENDER_PLAN_TYPE[]).reduce((acc, key) => {
      acc[key] = {
        ...mergeInfo[key],
        price_id: isProdAPI
          ? mergeInfo[key].price_id
          : mergeInfo[key].dev_price_id,
      }
      return acc
    }, {} as typeof planPricingInfo.data)
  }, [planPricingInfo.data])

  return {
    loading: planPricingInfo.loading,
    planPricingInfo: pricingInfoData,
    fetchPlanPricing,
    ...maxDiscountInfo,
  }
}

export default usePlanPricingInfo
