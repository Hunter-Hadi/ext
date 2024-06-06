import { useMemo } from 'react'
import { useRecoilValue } from 'recoil'

import {
  FirstFetchSurveyStatusLoadedAtom,
  HaveFilledOutSurveyAtom,
} from '@/features/survey/store'
import { ISurveyKeyType } from '@/features/survey/types'

const useSurveyFilledOutStatus = (surveyKey: ISurveyKeyType) => {
  const filledOutSurveyState = useRecoilValue(HaveFilledOutSurveyAtom)
  const firstFetchSurveyStatusLoaded = useRecoilValue(
    FirstFetchSurveyStatusLoadedAtom,
  )

  const alreadyFilledOutSurvey = useMemo(() => {
    if (!firstFetchSurveyStatusLoaded) {
      return false
    }

    return filledOutSurveyState[surveyKey] ?? false
  }, [filledOutSurveyState, firstFetchSurveyStatusLoaded, surveyKey])

  return {
    alreadyFilledOutSurvey,
  }
}

export default useSurveyFilledOutStatus
