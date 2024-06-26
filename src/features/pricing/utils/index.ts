import { IPlanPricingInfo, RENDER_PLAN_TYPE } from '@/features/pricing/type'

// 判断传入的 plan 是存在 有效的促销活动
export const checkTargetPlanTypeHasPromotion = (
  planPricing: IPlanPricingInfo,
) => {
  //  当 折扣值 > 0 并且 有对应的 coupon code 时，判断为有促销
  const { discount_value, promotion_code } = planPricing
  return (
    typeof discount_value === 'number' && discount_value > 0 && promotion_code
  )
}

// 获取 目标plan 的折扣后的价格
export const getTargetPlanDiscountedPrice = (planPricing: IPlanPricingInfo) => {
  const { discount_value, price } = planPricing
  return price * (discount_value ?? 1)
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
  planPricing: IPlanPricingInfo,
  pricingInfos: Record<RENDER_PLAN_TYPE, IPlanPricingInfo>,
) => {
  const monthlyPrice =
    pricingInfos[transformRenderTypeToPlanType(planPricing.type, 'monthly')]
      .price
  const yearlyPrice =
    pricingInfos[transformRenderTypeToPlanType(planPricing.type, 'yearly')]
      .price
  return Math.ceil((1 - yearlyPrice / 12 / monthlyPrice) * 100)
}

// 获取 plan 年付价格 相对于 月付价格 每年节省多少钱
// 公式: 月付价格 * 12 - 年付价格
export const getYearlyPriceOfMonthlyPriceHowMuchSaveUpEachYear = (
  currentPlan: RENDER_PLAN_TYPE,
  pricingInfos: Record<RENDER_PLAN_TYPE, IPlanPricingInfo>,
  checkHasPromotion?: boolean,
) => {
  const monthlyPrice =
    pricingInfos[transformRenderTypeToPlanType(currentPlan, 'monthly')].price

  // 获取 plan 的 yearly plan
  const currentYearlyPlan = transformRenderTypeToPlanType(currentPlan, 'yearly')
  const yearlyPrice = pricingInfos[currentYearlyPlan].price

  if (
    checkTargetPlanTypeHasPromotion(pricingInfos[currentYearlyPlan]) &&
    checkHasPromotion
  ) {
    const promotionPrice = getTargetPlanDiscountedPrice(
      pricingInfos[currentYearlyPlan],
    )
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
