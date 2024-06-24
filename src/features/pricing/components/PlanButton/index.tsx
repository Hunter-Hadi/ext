import LoadingButton from '@mui/lab/LoadingButton'
import { ButtonProps } from '@mui/material/Button'
import React, { FC, useEffect, useMemo } from 'react'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { PROMOTION_CODE_MAP } from '@/features/pricing/constants'
import usePaymentCreator from '@/features/pricing/hooks/usePaymentCreator'
import usePrefetchStripeLinks from '@/features/pricing/hooks/usePrefetchStripeLinks'
import { RENDER_PLAN_TYPE } from '@/features/pricing/type'

interface IPlanButtonProps extends ButtonProps {
  renderType: RENDER_PLAN_TYPE
  sendLog?: () => void
  prefetch?: boolean
}

const PlanButton: FC<IPlanButtonProps> = (props) => {
  const { prefetch, renderType, sendLog, children, ...resetProps } = props

  const [isClicked, setIsClicked] = React.useState(false)
  const isClickedRef = React.useRef(false)

  const { isFreeUser } = useUserInfo()

  const { getStripeLink, prefetchStripeLink, prefetching } =
    usePrefetchStripeLinks()

  // const {
  //   loading: fetching,
  //   createCheckoutSession,
  // } = usePaymentSessionFetcher()
  const { loading: fetching, createPaymentSubscription } = usePaymentCreator()

  const promotionCode = useMemo(
    () => PROMOTION_CODE_MAP[renderType],
    [renderType],
  )

  const buttonLoading = useMemo(() => {
    if (prefetch && isFreeUser) {
      // 当开启了 prefetch 时, button Loading 状态不跟着 fetch checkout loading 走
      // 当点击了按钮后才跟着 fetch checkout loading 走
      if (isClicked) {
        return fetching || prefetching
      } else {
        return false
      }
    } else {
      return fetching
    }
  }, [prefetch, isClicked, fetching, isFreeUser, prefetching])

  const handleClick = async () => {
    try {
      setIsClicked(true)
      sendLog && (await sendLog())

      // 如果当前是 prefetching 状态，那么不做任何操作
      // 等 prefetching 结束后，再执行 handleClick
      if (prefetching) {
        return
      }

      if (prefetch) {
        const stripeLink = await getStripeLink(
          renderType,
          promotionCode ? promotionCode : undefined,
        )

        if (stripeLink) {
          window.open(stripeLink)
        } else {
          window.open(`${APP_USE_CHAT_GPT_HOST}/pricing`)
        }
      } else {
        await createPaymentSubscription('elite_yearly')
      }

      setIsClicked(false)
    } catch (error) {
      setIsClicked(false)
    }
  }

  useEffect(() => {
    isClickedRef.current = isClicked
  }, [isClicked])

  useEffect(() => {
    // 只有 free user 才能预先获取 stripe link
    if (!isFreeUser) {
      return
    }

    let timer = -1
    // 如果 prefetch 为 true，那么预先获取 stripe link
    // 加个随机 1s～5s 的计时器，防止页面过多 link 同时请求
    if (prefetch) {
      const randomTime = Math.floor(Math.random() * 4000) + 1000
      timer = window.setTimeout(() => {
        if (renderType !== 'free') {
          prefetchStripeLink(renderType, promotionCode ? promotionCode : '')
        }
      }, randomTime)
    }

    return () => {
      timer && window.clearTimeout(timer)
    }
  }, [prefetch, promotionCode, isFreeUser, renderType, prefetchStripeLink])

  useEffect(() => {
    // 作用在，当组件还在 prefetching 时，用户点击了按钮
    // 会把 isClickedRef.current 设置成 true，
    // 等 prefetching 结束后，再执行 handleClick
    if (prefetch && isClickedRef.current && prefetching === false) {
      setTimeout(handleClick, 0)
    }
  }, [prefetch, prefetching])

  return (
    <LoadingButton
      variant='contained'
      {...resetProps}
      loading={buttonLoading}
      onClick={handleClick}
    >
      {children}
    </LoadingButton>
  )
}

export default PlanButton
