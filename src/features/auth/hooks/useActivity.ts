/**
 * 插件活动的hook
 */
import dayjs from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { OnBoardingKeyType } from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import { useAuthLogin } from '@/features/auth'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'

// 活动结束的时间
const ACTIVITY_END_TIME = '2024-03-01'
// 活动可以手动关闭banner的时间
const ACTIVITY_ABLE_CLOSE_START_TIME = '2023-12-21'

const currentActivityKey: OnBoardingKeyType =
  'ON_BOARDING_1ST_ANNIVERSARY_2024_BANNER'

const useActivity = () => {
  const { isLogin } = useAuthLogin()
  const { currentUserPlan, loading } = useUserInfo()
  const [isShowCurrentActivity, setIsShowCurrentActivity] = useState(false)
  // 是否是第一次加载，因为loading做为依赖，会闪烁
  const firstLoadingRef = useRef(false)
  // 是否展示活动的banner
  const isShowActivityBanner = useMemo(() => {
    // 活动结束banner
    if (dayjs().utc().diff(dayjs(ACTIVITY_END_TIME).utc()) > 0) {
      return false
    }
    // 如果是登录状态，且当前用户不是elite年费用户，且没有展示过，就展示活动的banner
    if (isLogin && (!loading || firstLoadingRef.current)) {
      firstLoadingRef.current = true
      if (
        (currentUserPlan.planName === 'ELITE_YEARLY' &&
          currentUserPlan.name === 'elite') ||
        currentUserPlan.isOneTimePayUser ||
        isShowCurrentActivity
      ) {
        return false
      }
      return true
    }
    return false
  }, [isLogin, isShowCurrentActivity, currentUserPlan, loading])
  /**
   * 是否可以关闭活动的banner
   */
  const isAbleToCloseActivityBanner = useMemo(() => {
    return dayjs().utc().diff(dayjs(ACTIVITY_ABLE_CLOSE_START_TIME).utc()) > 0
  }, [])
  /**
   * 关闭活动的banner
   */
  const handleCloseActivityBanner = async () => {
    await setChromeExtensionOnBoardingData(currentActivityKey, true)
    setIsShowCurrentActivity(true)
  }
  // 获取是否已经展示过活动的banner
  useEffect(() => {
    getChromeExtensionOnBoardingData().then((data) => {
      setIsShowCurrentActivity(data[currentActivityKey] as boolean)
    })
  }, [])
  return {
    isShowActivityBanner,
    isAbleToCloseActivityBanner,
    handleCloseActivityBanner,
  }
}
export default useActivity
