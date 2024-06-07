import {
  DISCOUNT_VALUE,
  PLAN_PRICE_MAP,
  PROMOTION_CODE_MAP,
} from 'src/features/pricing/constants'

import { RENDER_PLAN_TYPE } from '@/features/pricing/type'

// 判断传入的 plan 是存在 有效的促销活动
export const checkTargetPlanTypeHasPromotion = (
  targetPlan: RENDER_PLAN_TYPE,
) => {
  //  当 折扣值 > 0 并且 有对应的 coupon code 时，判断为有促销
  return DISCOUNT_VALUE[targetPlan] > 0 && PROMOTION_CODE_MAP[targetPlan]
}

// 获取 目标plan 的折扣后的价格
export const getTargetPlanDiscountedPrice = (plan: RENDER_PLAN_TYPE) => {
  const discount = DISCOUNT_VALUE[plan]
  const price = PLAN_PRICE_MAP[plan]
  return price * discount
}

export function calcPlanPrice(type: RENDER_PLAN_TYPE) {
  return PLAN_PRICE_MAP[type]
}

export function renderTypeToName(renderType: RENDER_PLAN_TYPE) {
  if (renderType !== 'free') {
    const renderTypeName = renderType.split('_')[0]
    return renderTypeName
  }

  // free
  return 'free'
}

// 获取 plan 月付价格相对于年费价格节省了多少百分比
// 公式：(1 - 年付价格 / 12 / 月付价格 ) * 100
export const getMonthlyPriceOfYearlyPriceDiscount = (
  plan: RENDER_PLAN_TYPE,
) => {
  const monthlyPrice =
    PLAN_PRICE_MAP[transformRenderTypeToPlanType(plan, 'monthly')]
  const yearlyPrice =
    PLAN_PRICE_MAP[transformRenderTypeToPlanType(plan, 'yearly')]
  return Math.ceil((1 - yearlyPrice / 12 / monthlyPrice) * 100)
}

// 获取 plan 年付价格 相对于 月付价格 每年节省多少钱
// 公式: 月付价格 * 12 - 年付价格
export const getYearlyPriceOfMonthlyPriceHowMuchSaveUpEachYear = (
  plan: RENDER_PLAN_TYPE,
  checkHasPromotion?: boolean,
) => {
  const monthlyPrice =
    PLAN_PRICE_MAP[transformRenderTypeToPlanType(plan, 'monthly')]

  // 获取 plan 的 yearly plan
  const currentYearlyPlan = transformRenderTypeToPlanType(plan, 'yearly')
  const yearlyPrice = PLAN_PRICE_MAP[currentYearlyPlan]

  if (checkTargetPlanTypeHasPromotion(currentYearlyPlan) && checkHasPromotion) {
    const promotionPrice = getTargetPlanDiscountedPrice(currentYearlyPlan)
    return Math.ceil(monthlyPrice * 12 - promotionPrice)
  }

  return Math.ceil(monthlyPrice * 12 - yearlyPrice)
}

// 把当前 RENDER_PLAN_TYPE 转换成指定的 plan type
export const transformRenderTypeToPlanType = (
  plan: RENDER_PLAN_TYPE,
  targetPlanType:
    | 'monthly'
    | 'yearly'
    | 'team_monthly'
    | 'team_yearly'
    | 'one_year',
) => {
  const planText = plan.split('_')[0] as RENDER_PLAN_TYPE

  if (targetPlanType === 'monthly') {
    return planText
  }

  if (targetPlanType === 'yearly') {
    return `${planText}_yearly` as RENDER_PLAN_TYPE
  }

  if (targetPlanType === 'team_monthly') {
    return `${planText}_team` as RENDER_PLAN_TYPE
  }

  if (targetPlanType === 'team_yearly') {
    // 暂时没有 team yearly 的 plan
    // return `${planText}_team_yearly` as RENDER_PLAN_TYPE;
    return planText
  }

  if (targetPlanType === 'one_year') {
    return `${planText}_one_year` as RENDER_PLAN_TYPE
  }

  return planText
}

// 判断传入的 plan 是 yearly、monthly、one_year
export const checkRenderTypeIsMonthlyOrYearlyOrOneYear = (
  plan: RENDER_PLAN_TYPE,
): 'monthly' | 'yearly' | 'one_year' => {
  if (plan.includes('yearly')) {
    return 'yearly'
  } else if (plan.includes('one_year')) {
    return 'one_year'
  } else {
    // 由于 monthly 的 render type 都是不带 _monthly 的，所以直接返回 monthly
    return 'monthly'
  }
}
