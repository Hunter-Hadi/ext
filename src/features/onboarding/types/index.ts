export type IOnBoardingSceneType =
  | 'CONTEXT_MENU_CTA_BUTTON'
  | 'FLOATING_CONTEXT_MENU_INPUT_BOX'
  | 'FLOATING_CONTEXT_MENU_LIST_BOX'
  | 'FLOATING_CONTEXT_MENU_REPLACE_SELECTION_MENUITEM'

// export type IOnBoardingTooltipOpenedCacheKey =
//   | 'ON_BOARDING_TOOLTIP__CONTEXT_MENU_CTA_BUTTON__OPENED'
//   | 'ON_BOARDING_TOOLTIP__FLOATING_CONTEXT_MENU_INPUT_BOX__OPENED'

// 使用模板字面量类型来生成 IOnBoardingTooltipOpenedCacheKey
export type IOnBoardingTooltipOpenedCacheKey =
  `ON_BOARDING_TOOLTIP__${IOnBoardingSceneType}__OPENED`
