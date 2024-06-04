import { ONBOARDING_TOOLTIP_SCENE_TYPES } from '@/features/onboarding/constants'

export type IOnBoardingSceneType =
  (typeof ONBOARDING_TOOLTIP_SCENE_TYPES)[number]

// 使用模板字面量类型来生成 IOnBoardingTooltipOpenedCacheKey
export type IOnBoardingTooltipOpenedCacheKey =
  `ON_BOARDING_TOOLTIP__${IOnBoardingSceneType}__OPENED`
