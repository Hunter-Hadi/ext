import { useSetRecoilState } from 'recoil'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useFocus } from '@/features/common/hooks/useFocus'
import { HaveFilledOutSurveyAtom } from '@/features/survey/store'
import { clientUpdateSurveyStatus } from '@/features/survey/utils'

const useInitSurveyState = () => {
  const setFilledOutSurvey = useSetRecoilState(HaveFilledOutSurveyAtom)

  const syncSurveyStatus = () => {
    clientUpdateSurveyStatus().then((responseFilledOutSurveyKeys) => {
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

  useFocus(syncSurveyStatus)

  return null
}

export default useInitSurveyState
