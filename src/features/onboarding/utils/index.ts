import Browser from 'webextension-polyfill'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import { CHROME_EXTENSION_LOCAL_ON_BOARDING_SAVE_KEY } from '@/constants'
import { ONBOARDING_TOOLTIP_SCENE_TYPES } from '@/features/onboarding/constants'
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
  const OnboardingTooltipSceneTypes = ONBOARDING_TOOLTIP_SCENE_TYPES

  const data = await getChromeExtensionOnBoardingData()
  OnboardingTooltipSceneTypes.forEach((sceneType) => {
    const cacheKey = onBoardingSceneTypeToOnBoardingCacheKey(sceneType)
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

export const findOnboardingTooltipElement = (
  sceneType: IOnBoardingSceneType,
  rootElement: HTMLElement | null = document.body,
) => {
  return rootElement?.querySelector(`#ONBOARDING_TOOLTIP__${sceneType}`)
}

export const findOnboardingReferenceElement = (
  container: HTMLElement,
  selector: string | string[],
) => {
  if (Array.isArray(selector)) {
    for (let i = 0; i < selector.length; i++) {
      const element = container.querySelector<HTMLElement>(selector[i])
      if (element) {
        return element
      }
    }
  } else {
    return container.querySelector<HTMLElement>(selector)
  }
}
