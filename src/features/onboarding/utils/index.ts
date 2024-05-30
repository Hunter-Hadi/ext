import Browser from 'webextension-polyfill'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import {
  CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY,
  isProduction,
} from '@/constants'
import {
  IOnBoardingSceneType,
  IOnBoardingTooltipOpenedCacheKey,
} from '@/features/onboarding/types'

export const onBoardingSceneTypeToOnBoardingCacheKey = (
  onBoardingSceneType: IOnBoardingSceneType,
): IOnBoardingTooltipOpenedCacheKey => {
  return `ON_BOARDING_TOOLTIP__${onBoardingSceneType}__OPENED`
}

// 刷新所有的 onboarding tooltip opened cache
// 用于测试环境调试
export const devResetAllOnboardingTooltipOpenedCache = async () => {
  if (isProduction) {
    return
  }
  const OnboardingTooltipOpenedCacheKeys: IOnBoardingTooltipOpenedCacheKey[] = [
    'ON_BOARDING_TOOLTIP__CONTEXT_MENU_CTA_BUTTON__OPENED',
    'ON_BOARDING_TOOLTIP__FLOATING_CONTEXT_MENU_INPUT_BOX__OPENED',
    'ON_BOARDING_TOOLTIP__FLOATING_CONTEXT_MENU_LIST_BOX__OPENED',
    'ON_BOARDING_TOOLTIP__FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM__OPENED',
  ]

  const data = await getChromeExtensionOnBoardingData()
  OnboardingTooltipOpenedCacheKeys.forEach((cacheKey) => {
    data[cacheKey] = false
  })

  await Browser.storage.local.set({
    [CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY]: JSON.stringify(data),
  })
}

export const getAlreadyOpenedCacheBySceneType = async (
  sceneType: IOnBoardingSceneType,
) => {
  const currentSceneTypeCacheKey =
    onBoardingSceneTypeToOnBoardingCacheKey(sceneType)
  const cache = await getChromeExtensionOnBoardingData()
  const opened = cache[currentSceneTypeCacheKey]
  return !!opened
}

export const setOpenedCacheBySceneType = async (
  sceneType: IOnBoardingSceneType,
) => {
  const currentSceneTypeCacheKey =
    onBoardingSceneTypeToOnBoardingCacheKey(sceneType)
  await setChromeExtensionOnBoardingData(currentSceneTypeCacheKey, true)
}
