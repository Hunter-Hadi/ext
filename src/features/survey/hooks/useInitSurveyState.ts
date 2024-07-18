import { useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil'

import { useCreateClientMessageListener } from '@/background/utils'
import { useAuthLogin } from '@/features/auth'
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
  const initSyncOnce = useRef(false)
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
    if (initSyncOnce.current) {
      return
    }
    if (isLogin) {
      getSurveyStatusInChromeExtensionLocalStorage().then((surveyStatus) => {
        // 如果缓存里是空的，就强行请求 api 更新一次
        syncSurveyStatus(!surveyStatus).then(() => {
          setFirstFetchSurveyStatusLoaded(true)
          initSyncOnce.current = true
        })
      })
    }
  }, [isLogin])

  useCreateClientMessageListener(async (event, data) => {
    // 初始化完成后，才开始监听
    if (!initSyncOnce.current) {
      return undefined
    }
    if (event === 'Client_listenSurveyStatusUpdated') {
      const responseFilledOutSurveyKeys = data
      setFilledOutSurvey((preState) => ({
        ...preState,
        ...responseFilledOutSurveyKeys,
      }))
      return {
        success: true,
        message: 'ok',
        data: {},
      }
    }
    return undefined
  })

  return null
}

export default useInitSurveyState
