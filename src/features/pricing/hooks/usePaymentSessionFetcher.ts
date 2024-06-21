import { useCallback } from 'react'
import { useRecoilState } from 'recoil'
import {
  DISCOUNT_VALUE,
  PLAN_FAIL_NAMES,
  PRICE_ID_MAP,
  PROMOTION_CODE_MAP,
} from 'src/features/pricing/constants'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { mixpanelTrack } from '@/features/mixpanel/utils'
import { CreateSessionLoadingAtom } from '@/features/pricing/store'
import {
  IPaymentSubscriptionMethod,
  RENDER_PLAN_TYPE,
} from '@/features/pricing/type'
import { calcPlanPrice } from '@/features/pricing/utils'
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

        const priceId = options?.coverPriceId ?? PRICE_ID_MAP[type]
        const paymentMethods = options?.paymentMethods

        let price = calcPlanPrice(type)
        const isValidCoupon = Boolean(
          PROMOTION_CODE_MAP[type] && PROMOTION_CODE_MAP[type] === coupon,
        )

        let discountValue = 1

        if (isValidCoupon) {
          discountValue = DISCOUNT_VALUE[type]
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
            setTimeout(() => {
              mixpanelTrack('purchase_started', {
                value: price,
                currency: 'USD',
                itemName: type,
                coupon,
              })
            }, 1000)
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
    [],
  )

  return { loading, createCheckoutSession }
}

export default usePaymentSessionFetcher
