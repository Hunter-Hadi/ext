import { useSetRecoilState } from 'recoil'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { HaveFilledOutSurveyAtom } from '@/features/survey/store'
import { clientUpdateSurveyStatus } from '@/features/survey/utils'

const useInitSurveyState = () => {
  const setFilledOutSurvey = useSetRecoilState(HaveFilledOutSurveyAtom)

  const syncSurveyStatus = (force = false) => {
    clientUpdateSurveyStatus(force).then((responseFilledOutSurveyKeys) => {
      if (
        responseFilledOutSurveyKeys &&
        Object.keys(responseFilledOutSurveyKeys).length > 0
      ) {
        setFilledOutSurvey((preState) => ({
          ...preState,
          ...responseFilledOutSurveyKeys,
        }))
      }
    })
  }

  useEffectOnce(() => {
    syncSurveyStatus()
  })

  return null
}

export default useInitSurveyState
