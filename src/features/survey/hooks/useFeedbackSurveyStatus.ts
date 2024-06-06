import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'

import { getChromeExtensionOnBoardingData } from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import {
  FirstFetchSurveyStatusLoadedAtom,
  HaveFilledOutSurveyAtom,
} from '@/features/survey/store'

const useFeedbackSurveyStatus = () => {
  const surveyKey = 'feedback'
  const [loaded, setLoaded] = useState(false)
  const { userInfo, isPayingUser } = useUserInfo()

  const filledOutSurveyState = useRecoilValue(HaveFilledOutSurveyAtom)
  const firstFetchSurveyStatusLoaded = useRecoilValue(
    FirstFetchSurveyStatusLoadedAtom,
  )
  const [alreadyPoppedSurveyModal, setAlreadyPoppedSurveyModal] =
    useState(false)

  const syncAlreadyPoppedSurveyModal = async () => {
    const onBoardingData = await getChromeExtensionOnBoardingData()
    if (onBoardingData['ON_BOARDING_EXTENSION_SURVEY_DIALOG_ALERT']) {
      setAlreadyPoppedSurveyModal(true)
    } else {
      setAlreadyPoppedSurveyModal(false)
    }
  }

  const canShowSurvey = useMemo(() => {
    if (!loaded || !firstFetchSurveyStatusLoaded) {
      return false
    }
    if (filledOutSurveyState[surveyKey]) {
      // 如果已经填写过了当前 survey，不再显示 survey
      return false
    }

    // 没登录时不显示 survey
    if (userInfo === null) {
      return false
    }

    // 注册时间
    const createAt = userInfo?.created_at
    // 第一次付费时间
    const subscribedAt = userInfo?.subscribed_at

    // 不是付费用户不显示 survey
    if (!isPayingUser) {
      return false
    }

    if (subscribedAt) {
      const limitDays = 14
      // 付费时间大于跟现在比大于 14 天, 不显示 survey
      if (dayjs(Date.now()).diff(subscribedAt * 1000, 'day') > limitDays) {
        // 显示 survey
        return true
      }
      return false
    } else if (createAt) {
      // 如果后端没有传回有效的第一次付费时间，就用注册时间比较
      const limitDays = 21
      // 注册时间跟现在比大于 21 天, 弹窗
      if (dayjs(Date.now()).diff(createAt, 'day') > limitDays) {
        // 显示 survey
        return true
      }
      return false
    }

    // 理论上不会走到这里，因为用户肯定会有 注册时间或者付费时间
    return false
  }, [
    userInfo,
    isPayingUser,
    filledOutSurveyState,
    loaded,
    firstFetchSurveyStatusLoaded,
    surveyKey,
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

  // useFocus(syncAlreadyPoppedSurveyModal)

  return {
    loaded,
    canShowSurvey,
    alreadyPoppedSurveyModal,
  }
}

export default useFeedbackSurveyStatus
