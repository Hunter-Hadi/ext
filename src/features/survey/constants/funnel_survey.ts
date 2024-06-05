import { IFunnelSurveySceneType, ISurveyKeyType } from '@/features/survey/types'

export const FUNNEL_SURVEY_CONFIG: Record<
  IFunnelSurveySceneType,
  {
    popupTitle: string
    questionSetting: {
      type: 'input'
      name: string
      label: string
      meta?: {
        placeholder?: string
      }
    }[]
  }
> = {
  SURVEY_CANCEL_COMPLETED: {
    popupTitle: 'survey:funnel_survey__SURVEY_CANCEL_COMPLETED__title',
    questionSetting: [
      {
        type: 'input',
        name: 'What concerns are keeping you from installing the extension?',
        label:
          'survey:funnel_survey__SURVEY_CANCEL_COMPLETED__question1__options1',
        meta: {
          placeholder:
            'survey:funnel_survey__SURVEY_CANCEL_COMPLETED__question1__options1__placeholder',
        },
      },
    ],
  },
}

export const FUNNEL_SURVEY_MIXPANEL_EVENTNAME: Record<
  IFunnelSurveySceneType,
  string
> = {
  SURVEY_CANCEL_COMPLETED: 'survey_cancel_completed_backend',
}

export const FUNNEL_SURVEY_KEY_MAP: Record<
  IFunnelSurveySceneType,
  ISurveyKeyType
> = {
  SURVEY_CANCEL_COMPLETED: 'funnel_survey__survey_cancel_completed',
}
