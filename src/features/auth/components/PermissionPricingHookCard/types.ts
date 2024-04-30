import { AI_MODEL_SERVICE_TEXTS_MAP } from '@/features/auth/constants'

// pricing hook card 渲染类型的声明
export type IPermissionPricingHookCardType =
  | 'FAST_TEXT_MODEL'
  | 'ADVANCED_MODEL'
  | 'IMAGE_MODEL'
  | 'AI_SEARCH'
  | 'AI_SUMMARY'
  | 'INSTANT_REPLY'

interface IPremiumAccessCardData {
  title: string
  accessItems: { featuresTitle: string; featuresDescription: string }[]
  learnMore?: boolean
}

export const PREMIUM_ACCESS_CARD_SETTINGS_MAP: {
  [key in IPermissionPricingHookCardType]: IPremiumAccessCardData
} = {
  FAST_TEXT_MODEL: {
    title: 'client:permission__pricing_hook__ai_model_queries_card__title',
    accessItems: [
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_model_queries_card__fast_text',
        featuresDescription: AI_MODEL_SERVICE_TEXTS_MAP['fastText'],
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_model_queries_card__advanced_text',
        featuresDescription: AI_MODEL_SERVICE_TEXTS_MAP['advancedText'],
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_model_queries_card__image_text',
        featuresDescription: AI_MODEL_SERVICE_TEXTS_MAP['imageGenerate'],
      },
    ],
    learnMore: true,
  },
  ADVANCED_MODEL: {
    title: 'client:permission__pricing_hook__ai_model_queries_card__title',
    accessItems: [
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_model_queries_card__fast_text',
        featuresDescription: AI_MODEL_SERVICE_TEXTS_MAP['fastText'],
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_model_queries_card__advanced_text',
        featuresDescription: AI_MODEL_SERVICE_TEXTS_MAP['advancedText'],
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_model_queries_card__image_text',
        featuresDescription: AI_MODEL_SERVICE_TEXTS_MAP['imageGenerate'],
      },
    ],
    learnMore: true,
  },
  IMAGE_MODEL: {
    title: 'client:permission__pricing_hook__ai_model_queries_card__title',
    accessItems: [
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_model_queries_card__fast_text',
        featuresDescription: AI_MODEL_SERVICE_TEXTS_MAP['fastText'],
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_model_queries_card__advanced_text',
        featuresDescription: AI_MODEL_SERVICE_TEXTS_MAP['advancedText'],
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_model_queries_card__image_text',
        featuresDescription: AI_MODEL_SERVICE_TEXTS_MAP['imageGenerate'],
      },
    ],
    learnMore: true,
  },
  AI_SEARCH: {
    title:
      'client:permission__pricing_hook__ai_search__more_content_card__title',
    accessItems: [
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_search__more_content_card__item1__title',
        featuresDescription:
          'client:permission__pricing_hook__ai_search__more_content_card__item1__description',
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_search__more_content_card__item2__title',
        featuresDescription:
          'client:permission__pricing_hook__ai_search__more_content_card__item2__description',
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_search__more_content_card__item3__title',
        featuresDescription:
          'client:permission__pricing_hook__ai_search__more_content_card__item3__description',
      },
    ],
    learnMore: true,
  },
  AI_SUMMARY: {
    title:
      'client:permission__pricing_hook__ai_summary__more_content_card__title',
    accessItems: [
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_summary__more_content_card__item1__title',
        featuresDescription:
          'client:permission__pricing_hook__ai_summary__more_content_card__item1__description',
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_summary__more_content_card__item2__title',
        featuresDescription:
          'client:permission__pricing_hook__ai_summary__more_content_card__item2__description',
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__ai_summary__more_content_card__item3__title',
        featuresDescription:
          'client:permission__pricing_hook__ai_summary__more_content_card__item3__description',
      },
    ],
    learnMore: true,
  },
  INSTANT_REPLY: {
    title:
      'client:permission__pricing_hook__instant_reply__more_content_card__title',
    accessItems: [
      {
        featuresTitle:
          'client:permission__pricing_hook__instant_reply__more_content_card__item1__title',
        featuresDescription:
          'client:permission__pricing_hook__instant_reply__more_content_card__item1__description',
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__instant_reply__more_content_card__item2__title',
        featuresDescription:
          'client:permission__pricing_hook__instant_reply__more_content_card__item2__description',
      },
      {
        featuresTitle:
          'client:permission__pricing_hook__instant_reply__more_content_card__item3__title',
        featuresDescription:
          'client:permission__pricing_hook__instant_reply__more_content_card__item3__description',
      },
    ],
    learnMore: true,
  },
}
