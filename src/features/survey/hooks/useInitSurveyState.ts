import { useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil'

import { useAuthLogin } from '@/features/auth/hooks/useAuthLogin'
import {
  FirstFetchSurveyStatusLoadedAtom,
  HaveFilledOutSurveyAtom,
} from '@/features/survey/store'
import {
  clientUpdateSurveyStatus,
  getSurveyStatusInChromeExtensionLocalStorage,
} from '@/features/survey/utils'

const useInitSurveyState = () => {
  const setFilledOutSurvey = useSetRecoilState(HaveFilledOutSurveyAtom)
  const setFirstFetchSurveyStatusLoaded = useSetRecoilState(
    FirstFetchSurveyStatusLoadedAtom,
  )
  const { isLogin } = useAuthLogin()
  const syncOnce = useRef(false)

  const syncSurveyStatus = async (force = false) => {
    const responseFilledOutSurveyKeys = await clientUpdateSurveyStatus(force)
    if (
      responseFilledOutSurveyKeys &&
      Object.keys(responseFilledOutSurveyKeys).length > 0
    ) {
      setFilledOutSurvey((preState) => ({
        ...preState,
        ...responseFilledOutSurveyKeys,
      }))
    }
  }

  useEffect(() => {
    if (syncOnce.current) {
      return
    }
    if (isLogin) {
      getSurveyStatusInChromeExtensionLocalStorage().then((surveyStatus) => {
        // 如果缓存里是空的，就强行请求 api 更新一次
        syncSurveyStatus(!surveyStatus).then(() => {
          setFirstFetchSurveyStatusLoaded(true)
          syncOnce.current = true
        })
      })
    }
  }, [isLogin])

  return null
}

export default useInitSurveyState
