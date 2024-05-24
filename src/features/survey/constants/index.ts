import { ISurveyKeyType } from '@/features/survey/types'

// 目前合法的 surveyKey
export const VALID_SURVEY_KEYS = [
  'feedback', //第一次 survey type: feedback; create by: 2024-05-24
] as const

// 临时的标记，因为目前只有一种 survey，所以先写死
export const currentSurveyKey: ISurveyKeyType = 'zztest3'
// export const currentSurveyKey: ISurveyKeyType = 'feedback'
