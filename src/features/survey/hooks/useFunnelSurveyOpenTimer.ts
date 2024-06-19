import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEffect, useState } from 'react'

import { getChromeExtensionOnBoardingData } from '@/background/utils'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useFunnelSurveyController from '@/features/survey/hooks/useFunnelSurveyController'
import { IFunnelSurveySceneType } from '@/features/survey/types'
import { getFunnelSurveyOnboardingStorageKey } from '@/features/survey/utils/storageWithSceneType'

dayjs.extend(utc)

const useFunnelSurveyOpenTimer = (
  enabled: boolean,
  sceneType: IFunnelSurveySceneType,
) => {
  const [loaded, setLoaded] = useState(false)
  const { openPopup, closePopup } = useFunnelSurveyController(sceneType)

  const { userInfo } = useUserInfo()

  const [alreadyPoppedSurveyModal, setAlreadyPoppedSurveyModal] =
    useState(false)

  const syncAlreadyPoppedSurveyModal = async () => {
    const onBoardingData = await getChromeExtensionOnBoardingData()
    const onboardingStorageKey = getFunnelSurveyOnboardingStorageKey(sceneType)
    if (onBoardingData[onboardingStorageKey]) {
      setAlreadyPoppedSurveyModal(true)
    } else {
      setAlreadyPoppedSurveyModal(false)
    }
  }

  // 不同 funnel survey 的弹出时机
  useEffect(() => {
    if (sceneType !== 'SURVEY_CANCEL_COMPLETED') {
      return
    }

    if (!loaded || !enabled) {
      return
    }

    if (alreadyPoppedSurveyModal) {
      return
    }

    // 如果 subscription_canceled_at 是空值，不弹窗
    if (!userInfo?.subscription_canceled_at) {
      return
    }

    const cancelledAt = dayjs.utc(userInfo.subscription_canceled_at)
    const now = dayjs.utc()
    if (now.diff(cancelledAt, 'day') < 30) {
      openPopup(1200) // 1.2s
      setAlreadyPoppedSurveyModal(true)
    } else {
      closePopup()
    }
  }, [
    enabled,
    sceneType,
    userInfo?.subscription_canceled_at,
    loaded,
    alreadyPoppedSurveyModal,
  ])

  useEffect(() => {
    // 用户信息加载完毕
    if (userInfo) {
      // 同步是否弹过 survey modal 的状态，
      // 同步完才能 set loaded 为 true
      syncAlreadyPoppedSurveyModal().then(() => {
        setLoaded(true)
      })
    }
  }, [userInfo])

  return null
}

export default useFunnelSurveyOpenTimer
