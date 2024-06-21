import { useCallback } from 'react'
import { atom, useRecoilState } from 'recoil'

import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import usePaymentSessionFetcher from '@/features/pricing/hooks/usePaymentSessionFetcher'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'
import {
  generateCheckoutCacheKey,
  getStripeLinkCache,
  setStripeLinkCache,
} from '@/features/pricing/utils/cacheStripeLinksHelper'

const PrefetchingAtom = atom({
  key: 'PrefetchingAtom',
  default: false,
})

let MAXAI__PREFETCH_STRIPE_LINKS_QUEUE: string[] = []
const addPrefetchQueue = (taskId: string) => {
  MAXAI__PREFETCH_STRIPE_LINKS_QUEUE.push(taskId)
}
const removePrefetchQueue = (taskId: string) => {
  MAXAI__PREFETCH_STRIPE_LINKS_QUEUE = MAXAI__PREFETCH_STRIPE_LINKS_QUEUE.filter(
    (id) => id !== taskId,
  )
}

const usePrefetchStripeLinks = () => {
  const [prefetching, setPrefetching] = useRecoilState(PrefetchingAtom)

  const { isFreeUser } = useUserInfo()

  const { createCheckoutSession } = usePaymentSessionFetcher()

  // 从 api 中获取 stripe link
  const fetchStripeLink = useCallback(
    async (plan: RENDER_PLAN_TYPE, couponCode = '') => {
      try {
        // if (checkRenderTypeIsMonthlyOrYearlyOrOneYear(plan) === 'one_year') {
        //   // 如果是一次性付款的用户，需要换个函数调用
        //   const data = await createOneTimeCheckoutSession(plan, couponCode)
        //   if (data && data.redirect_url) {
        //     return data.redirect_url
        //   }
        // } else {
        const data = await createCheckoutSession(plan, couponCode, {
          noSendLog: true,
        })
        if (data && data.redirect_url) {
          return data.redirect_url
        }
        // }
      } catch (e) {
        console.log(e)
        return null
      }
    },
    [],
  )

  // 获取 stripe link, 会先从 缓存里获取，如果没有再去请求 api
  const getStripeLink = useCallback(
    async (plan: RENDER_PLAN_TYPE, couponCode = '') => {
      const cacheStripeLink = await getStripeLinkCache(plan, couponCode)
      // 有缓存直接返回缓存里的
      if (cacheStripeLink) {
        return cacheStripeLink
      }

      // 没有缓存，去请求 api，并且set 到缓存里
      const stripeLink = await fetchStripeLink(plan, couponCode)
      if (stripeLink) {
        setStripeLinkCache(stripeLink, plan, couponCode)
      }
      return stripeLink
    },
    [],
  )

  // 预先获取 stripe link
  const prefetchStripeLink = useCallback(
    async (plan: RENDER_PLAN_TYPE, couponCode = '') => {
      const cacheStripeLink = await getStripeLinkCache(plan, couponCode)
      if (cacheStripeLink) {
        // 有缓存了，不请求
        return
      }

      const taskId = generateCheckoutCacheKey(plan, couponCode)
      if (MAXAI__PREFETCH_STRIPE_LINKS_QUEUE.includes(taskId)) {
        // 任务已经在队列中了
        return
      }

      // 只有 free user 才能预先获取 stripe link
      if (!isFreeUser) {
        return
      }

      // 没有缓存，去请求 api，并且set 到缓存里
      setPrefetching(true)
      addPrefetchQueue(taskId)
      const stripeLink = await fetchStripeLink(plan, couponCode)
      if (stripeLink) {
        setStripeLinkCache(stripeLink, plan, couponCode)
      }
      setPrefetching(false)
      removePrefetchQueue(taskId)
    },
    [isFreeUser],
  )

  return {
    prefetching,
    getStripeLink,
    prefetchStripeLink,
  }
}

export default usePrefetchStripeLinks
