import { VALID_SURVEY_KEYS } from '@/features/survey/constants'

// 不同问卷的 type
export type ISurveyKeyType = (typeof VALID_SURVEY_KEYS)[number]

// funnel survey scene type
export type IFunnelSurveySceneType = 'SURVEY_CANCEL_COMPLETED'

// 不同 survey 的问卷 是否弹窗过 的 onboarding 缓存 key
export type ISurveyOpenedOnBoardingStorageKey =
  | 'ON_BOARDING_EXTENSION_SURVEY_DIALOG_ALERT' // feedback 的问卷弹窗标记
  | `ON_BOARDING_EXTENSION__${IFunnelSurveySceneType}__DIALOG_ALERT`
