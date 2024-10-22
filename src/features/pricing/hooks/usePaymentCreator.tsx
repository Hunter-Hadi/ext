import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import usePaymentSessionFetcher from '@/features/pricing/hooks/usePaymentSessionFetcher'
import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'
import {
  checkRenderTypeIsMonthlyOrYearlyOrOneYear,
  checkTargetPlanTypeHasPromotion,
} from '@/features/pricing/utils'

const usePaymentCreator = () => {
  const { loading, createCheckoutSession } = usePaymentSessionFetcher()
  const { planPricingInfo } = usePlanPricingInfo()
  const { isPayingUser } = useUserInfo()

  // 本次购买的 plan 时是否是 升级 plan 的操作, 如果是 elite 或者是 pro 则是升级操作
  const isUpgradePlan = isPayingUser

  const createPaymentSubscription = async (
    subscriptionPaymentPlan: RENDER_PLAN_TYPE,
    concatUsCallback?: (planText: string) => void,
  ) => {
    try {
      const planPricing = planPricingInfo[subscriptionPaymentPlan]

      // const currentUserRoleValue = USER_ROLE_PRIORITY[currentUserPlan.name] // 当前角色的优先级值

      // // 如果当前购买的 plan 是一次性付款的，那么需要弹出联系我们的 modal
      // if (
      //   currentUserRoleValue > 0 &&
      //   currentUserPlan.planName?.includes('ONE_YEAR')
      // ) {
      //   const planText = subscriptionPaymentPlan
      //     ? capitalize(renderTypeToName(subscriptionPaymentPlan))
      //     : 'Free'
      //   concatUsCallback?.(planText)
      //   return
      // }

      // 插件里目前无需一下逻辑
      // Team plan 的用户不支持用户通过 portal 来管理升级/取消plan
      // individual plan 的用户不支持升级到 team plan

      // 如果当前是升级plan 的操作, 直接跳转到pricing页面
      if (isUpgradePlan) {
        let paymentType = 'yearly'
        if (
          checkRenderTypeIsMonthlyOrYearlyOrOneYear(subscriptionPaymentPlan) ===
          'monthly'
        ) {
          paymentType = 'monthly'
        }
        window.open(
          `${APP_USE_CHAT_GPT_HOST}/pricing?autoClickPlan=${subscriptionPaymentPlan}&paymentType=${paymentType}`,
        )
        return
      }

      const targetPaymentPlanHasPromotion =
        checkTargetPlanTypeHasPromotion(planPricing)

      const targetPaymentPromotionCode =
        planPricingInfo[subscriptionPaymentPlan].promotion_code

      // 如果是升级 plan，那么直接跳转到 portal
      const data = await createCheckoutSession(
        subscriptionPaymentPlan,
        targetPaymentPlanHasPromotion && targetPaymentPromotionCode
          ? targetPaymentPromotionCode
          : undefined,
      )

      if (data && data.redirect_url) {
        if (location.origin === APP_USE_CHAT_GPT_HOST) {
          window.location.href = data.redirect_url
        } else {
          window.open(data.redirect_url)
        }
      } else {
        window.open(`${APP_USE_CHAT_GPT_HOST}/pricing`)
      }
    } catch (e) {
      window.open(`${APP_USE_CHAT_GPT_HOST}/pricing`)
      console.error(e)
    }
  }

  return {
    loading,
    createPaymentSubscription,
  }
}

export default usePaymentCreator
