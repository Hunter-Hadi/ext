import isNumber from 'lodash-es/isNumber'
import { useCallback, useEffect, useMemo } from 'react'
import { useRecoilState } from 'recoil'

import { isProdAPI } from '@/constants'
import { PlanPricingInfoAtom } from '@/features/pricing/store'
import { IPlanPricingInfo } from '@/features/pricing/type'
import { aesJsonDecrypt } from '@/features/security'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { clientMaxAIGet } from '@/utils/request'

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

// pricing页面会在upgrade hover卡片里调用
// 先简单记录一下防止快速显示关闭重复调用请求
let fetchTime = 0

// 目前pricing modal和upgrade不在同一个provider下
// 这里先简单存储一下
let fetchData: Record<string, any> = {}

const usePlanPricingInfo = () => {
  const [planPricingInfo, setPlanPricingInfo] =
    useRecoilState(PlanPricingInfoAtom)

  useEffect(() => {
    setPlanPricingInfo((prev) => {
      return {
        ...prev,
        data: mergeWithObject([prev.data, fetchData]),
      }
    })
  }, [])

  useEffect(() => {
    Object.values(planPricingInfo.data).forEach((info) => {
      if (!isProdAPI) {
        info.price_id = info.dev_price_id
      }
    })
  }, [planPricingInfo.data])

  // 注意接口里的elite_monthly要转换为elite，前端目前monthly的类型没有后缀
  const fetchPlanPricing = useCallback(async () => {
    if (Date.now() - fetchTime < 15000) return
    fetchTime = Date.now()
    setPlanPricingInfo((prev) => ({
      ...prev,
      loading: true,
    }))
    try {
      const result = await clientMaxAIGet<string>(
        '/app/get_subscription_pricing',
      )
      if (result?.data) {
        const data = aesJsonDecrypt(result.data)
        Object.keys(data).forEach((key) => {
          if (key.includes('monthly')) {
            data[`${key.replace('_monthly', '')}`] = data[key]
            delete data[key]
          }
        })
        fetchData = data
        setPlanPricingInfo((prev) => {
          return {
            ...prev,
            loading: false,
            data: mergeWithObject([prev.data, data]),
          }
        })
      } else {
        setPlanPricingInfo((prev) => ({
          ...prev,
          loading: false,
        }))
      }
    } catch (e) {
      console.error(e)
      setPlanPricingInfo((prev) => ({
        ...prev,
        loading: false,
      }))
    }
  }, [])

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

  return {
    loading: planPricingInfo.loading,
    planPricingInfo: planPricingInfo.data,
    fetchPlanPricing,
    ...maxDiscountInfo,
  }
}

export default usePlanPricingInfo
