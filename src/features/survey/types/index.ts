import { VALID_SURVEY_KEYS } from '@/features/survey/constants'

// 不同问卷的 type
export type ISurveyKeyType = (typeof VALID_SURVEY_KEYS)[number]
