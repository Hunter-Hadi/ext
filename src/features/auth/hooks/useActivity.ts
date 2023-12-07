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
  const [isActivityChristmas2023, setIsActivityChristmas2023] = useState(false)
  // 是否是第一次加载，因为loading做为依赖，会闪烁
  const firstLoadingRef = useRef(false)
  // 是否展示活动的banner
  const isShowActivityBanner = useMemo(() => {
    // 如果是登录状态，且当前用户不是elite年费用户，且没有展示过，就展示黑五活动的banner
    if (isLogin && (!loading || firstLoadingRef.current)) {
      firstLoadingRef.current = true
      if (
        (currentUserPlan.planName === 'ELITE_YEARLY' &&
          currentUserPlan.name === 'elite') ||
        isActivityChristmas2023
      ) {
        return false
      }
      return true
    }
    return false
  }, [isLogin, isActivityChristmas2023, currentUserPlan, loading])
  /**
   * 是否可以关闭活动的banner
   */
  const isAbleToCloseActivityBanner = useMemo(() => {
    return dayjs().utc().diff(dayjs('2023-12-31').utc()) > 0
  }, [])
  /**
   * 关闭活动的banner
   */
  const handleCloseActivityBanner = async () => {
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_CHRISTMAS_2023_BANNER',
      true,
    )
    setIsActivityChristmas2023(true)
  }
  // 获取是否已经展示过活动的banner
  useEffect(() => {
    getChromeExtensionOnBoardingData().then((data) => {
      setIsActivityChristmas2023(
        data.ON_BOARDING_CHRISTMAS_2023_BANNER as boolean,
      )
    })
  }, [])
  return {
    isShowActivityBanner,
    isAbleToCloseActivityBanner,
    handleCloseActivityBanner,
  }
}
export default useActivity
