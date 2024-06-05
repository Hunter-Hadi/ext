import { setChromeExtensionOnBoardingData } from '@/background/utils'
import {
  IFunnelSurveySceneType,
  ISurveyOpenedOnBoardingStorageKey,
} from '@/features/survey/types'

export const getFunnelSurveyOnboardingStorageKey = (
  sceneType: IFunnelSurveySceneType,
): ISurveyOpenedOnBoardingStorageKey => {
  return `ON_BOARDING_EXTENSION__${sceneType}__DIALOG_ALERT` as ISurveyOpenedOnBoardingStorageKey
}

// 重置 funnel survey opened 状态
export const resetFunnelSurveyOpenedStorageFlag = async (
  sceneType: IFunnelSurveySceneType,
) => {
  const storageKey = getFunnelSurveyOnboardingStorageKey(sceneType)
  await setChromeExtensionOnBoardingData(storageKey, false)
}
