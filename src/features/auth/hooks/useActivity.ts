/**
 * 插件活动的hook
 */
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { useAuthLogin } from '@/features/auth'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import dayjs from 'dayjs'

const useActivity = () => {
  const { isLogin } = useAuthLogin()
  const { currentUserPlan, loading } = useUserInfo()
  const [isActivityBlackFriday2023, setIsActivityBlackFriday2023] = useState(
    false,
  )
  // 是否是第一次加载，因为loading做为依赖，会闪烁
  const firstLoadingRef = useRef(false)
  // 是否展示黑五活动的banner
  const isShowBlackFridayBanner = useMemo(() => {
    // 如果是登录状态，且当前用户不是elite年费用户，且没有展示过，就展示黑五活动的banner
    if (isLogin && (!loading || firstLoadingRef.current)) {
      firstLoadingRef.current = true
      if (
        currentUserPlan.name !== 'elite' &&
        currentUserPlan.planName !== 'ELITE_YEARLY' &&
        !isActivityBlackFriday2023
      ) {
        return true
      }
    }
    return false
  }, [isLogin, isActivityBlackFriday2023, currentUserPlan, loading])
  /**
   * 是否可以关闭黑五活动的banner
   */
  const isAbleToCloseBlackFridayBanner = useMemo(() => {
    return dayjs().utc().diff(dayjs('2023-12-01').utc()) > 0
  }, [])
  /**
   * 关闭黑五活动的banner
   */
  const handleCloseBlackFriday2023Banner = async () => {
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_BLACK_FRIDAY_2023_BANNER',
      true,
    )
  }
  // 获取是否已经展示过黑五活动的banner
  useEffect(() => {
    getChromeExtensionOnBoardingData().then((data) => {
      setIsActivityBlackFriday2023(
        data.ON_BOARDING_BLACK_FRIDAY_2023_BANNER as boolean,
      )
    })
  }, [])
  return {
    isShowBlackFridayBanner,
    isAbleToCloseBlackFridayBanner,
    handleCloseBlackFriday2023Banner,
  }
}
export default useActivity
