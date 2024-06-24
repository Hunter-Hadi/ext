import { useCallback } from 'react'
import { useRecoilState } from 'recoil'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import { PLAN_FAIL_NAMES } from '@/features/pricing/constants'
import usePlanPricingInfo from '@/features/pricing/hooks/usePlanPricingInfo'
import { CreateSessionLoadingAtom } from '@/features/pricing/store'
import {
  IPaymentSubscriptionMethod,
  RENDER_PLAN_TYPE,
} from '@/features/pricing/type'
import { roundToDecimal } from '@/utils/dataHelper/numberHelper'
import Toast from '@/utils/globalSnackbar'
import { post } from '@/utils/request'

/**
 * 网页触发支付的时候发送事件给插件
 * 注意这里的successUrl和cancelUrl和后端保持一致
 * @param paymentUrl
 * @param planType
 */
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
function sendPaymentUrlMessage(paymentUrl: string, planType: RENDER_PLAN_TYPE) {
  if (planType === 'free') return
  if (!paymentUrl || !PLAN_FAIL_NAMES[planType]) return

  const type = PLAN_FAIL_NAMES[planType]

  port.postMessage({
    event: 'Client_createPaymentUrl',
    data: {
      paymentUrl,
      planType,
      // 这里的successUrl插件只会用来判断跳转的是successUrl则不做处理, 这里无需携带参数
      successUrl: `${APP_USE_CHAT_GPT_HOST}/payment/success`,
      cancelUrl: `${APP_USE_CHAT_GPT_HOST}/payment/error?type=${type}`,
    },
  })
  // window.postMessage(
  //   {
  //     type: 'MAXAI_CREATE_PAYMENT_URL',
  //     data: {
  //       paymentUrl,
  //       planType,
  //       // 这里的successUrl插件只会用来判断跳转的是successUrl则不做处理, 这里无需携带参数
  //       successUrl: `${APP_USE_CHAT_GPT_HOST}/payment/success`,
  //       cancelUrl: `${APP_USE_CHAT_GPT_HOST}/payment/error?type=${type}`,
  //     },
  //   },
  //   '*',
  // )
}

const usePaymentSessionFetcher = () => {
  const [loading, setLoading] = useRecoilState(CreateSessionLoadingAtom)

  const { planPricingInfo } = usePlanPricingInfo()

  const createCheckoutSession = useCallback(
    async (
      type: RENDER_PLAN_TYPE,
      coupon = '',
      options?: {
        coverPriceId?: string
        paymentMethods?: IPaymentSubscriptionMethod[]
        noSendLog?: boolean
      },
    ) => {
      try {
        setLoading(true)

        const { price_id, promotion_code, discount_value } =
          planPricingInfo[type] || {}

        const priceId = options?.coverPriceId ?? price_id
        const paymentMethods = options?.paymentMethods

        let price = planPricingInfo[type].price
        const isValidCoupon = Boolean(
          promotion_code && promotion_code === coupon,
        )

        let discountValue = 1

        if (isValidCoupon) {
          discountValue = discount_value ?? 1
          price = roundToDecimal(price * discountValue)
        }

        const result = await post<{ redirect_url: string }>(
          '/subscription/create_checkout_session',
          {
            price_id: priceId,
            // add_free_trial: false,
            promotion_code: coupon,
            payment_methods: paymentMethods,
          },
        )
        if (result?.data) {
          // 防止和mixpanel防抖冲突
          if (!options?.noSendLog) {
            mixpanelTrack('purchase_started', {
              value: price,
              currency: 'USD',
              itemName: type,
              coupon,
            })
          }
          sendPaymentUrlMessage(result.data.redirect_url, type)
          return result.data
        }
        return null
      } catch (error: any) {
        console.log(`createCheckoutSession error`, error)
        if (error?.response?.data?.code) {
          const errorCode = error?.response?.data?.code
          if (errorCode === 20004) {
            Toast.warning('Your already subscribed to a plan.')
          }
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    [planPricingInfo],
  )

  const createPortalSession = useCallback(
    async (type: RENDER_PLAN_TYPE, coupon = '') => {
      try {
        setLoading(true)

        const { promotion_code, discount_value } = planPricingInfo[type] || {}

        let price = planPricingInfo[type].price

        const isValidCoupon = Boolean(
          promotion_code && promotion_code === coupon,
        )

        let discountValue = 1

        if (isValidCoupon) {
          discountValue = discount_value ?? 1
          price = roundToDecimal(price * discountValue)
        }

        mixpanelTrack('change_plan_started', {
          value: price,
          currency: 'USD',
          itemName: type,
          coupon,
        })

        const result = await post<{ redirect_url: string }>(
          '/subscription/create_one_time_checkout_session',
          {},
        )
        if (result?.data) {
          return result.data
        }
        return null
      } catch (error: any) {
        console.log(`createCheckoutSession error`, error)

        if (error?.response?.data?.detail) {
          const errorMsg = error?.response?.data?.detail
          Toast.error(errorMsg)
        }

        return null
      } finally {
        setLoading(false)
      }
    },
    [planPricingInfo],
  )

  return { loading, createCheckoutSession, createPortalSession }
}

export default usePaymentSessionFetcher
