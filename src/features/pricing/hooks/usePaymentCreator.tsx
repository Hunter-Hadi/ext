import { PROMOTION_CODE_MAP } from 'src/features/pricing/constants'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import usePaymentSessionFetcher from '@/features/pricing/hooks/usePaymentSessionFetcher'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'
import { checkTargetPlanTypeHasPromotion } from '@/features/pricing/utils'

const usePaymentCreator = () => {
  const { loading, createCheckoutSession } = usePaymentSessionFetcher()

  const createPaymentSubscription = async (
    subscriptionPaymentPlan: RENDER_PLAN_TYPE,
  ) => {
    try {
      const targetPaymentPlanHasPromotion = checkTargetPlanTypeHasPromotion(
        subscriptionPaymentPlan,
      )

      const targetPaymentPromotionCode =
        PROMOTION_CODE_MAP[subscriptionPaymentPlan]

      const data = await createCheckoutSession(
        subscriptionPaymentPlan,
        targetPaymentPlanHasPromotion && targetPaymentPromotionCode
          ? targetPaymentPromotionCode
          : undefined,
      )
      if (data && data.redirect_url) {
        window.open(data.redirect_url)
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
