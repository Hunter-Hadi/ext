import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import React from 'react'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

export const PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST = [
  'TOTAL_CHAT_DAILY_LIMIT',
  'CUSTOM_PROMPT',
  'AI_RESPONSE_LANGUAGE',
  'PDF_AI_VIEWER',
  'PREFERRED_LANGUAGE',
  'PAGE_SUMMARY',
  'CHATGPT_STABLE_MODE',
  'MAXAI_CHATGPT_TEMPERATURE',
  'MAXAI_PAID_MODEL_GPT3_5',
  'MAXAI_PAID_MODEL_GPT3_5_16K',
  'MAXAI_PAID_MODEL_GPT4',
  'MAXAI_PAID_MODEL_GPT4_TURBO',
  'MAXAI_PAID_MODEL_CLAUDE_INSTANT_V1',
  'MAXAI_PAID_MODEL_CLAUDE_V2',
  'MAXAI_PAID_MODEL_GEMINI_PRO',
  'MAXAI_PAID_MODEL_CLAUDE_V2_1',
  'MAXAI_PAID_MODEL_CLAUDE_V3_HAIKU',
  'MAXAI_PAID_MODEL_CLAUDE_V3_SONNET',
  'MAXAI_PAID_MODEL_CLAUDE_V3_OPUS',
  'MAXAI_PAID_MODEL_GPT4_VISION',
  'CUSTOM_PROMPT_GROUP',
  'GMAIL_DRAFT_BUTTON',
  'GMAIL_REPLY_BUTTON',
  'GMAIL_CONTEXT_MENU',
  'OUTLOOK_COMPOSE_NEW_BUTTON',
  'OUTLOOK_COMPOSE_REPLY_BUTTON',
  'OUTLOOK_REFINE_DRAFT_BUTTON',
  'TWITTER_COMPOSE_NEW_BUTTON',
  'TWITTER_COMPOSE_REPLY_BUTTON',
  'TWITTER_REFINE_DRAFT_BUTTON',
  'LINKEDIN_COMPOSE_NEW_BUTTON',
  'LINKEDIN_COMPOSE_REPLY_BUTTON',
  'LINKEDIN_REFINE_DRAFT_BUTTON',
  'FACEBOOK_COMPOSE_NEW_BUTTON',
  'FACEBOOK_COMPOSE_REPLY_BUTTON',
  'FACEBOOK_REFINE_DRAFT_BUTTON',
  'YOUTUBE_COMPOSE_NEW_BUTTON',
  'YOUTUBE_COMPOSE_REPLY_BUTTON',
  'YOUTUBE_REFINE_DRAFT_BUTTON',
  'INSTAGRAM_COMPOSE_NEW_BUTTON',
  'INSTAGRAM_COMPOSE_REPLY_BUTTON',
  'INSTAGRAM_REFINE_DRAFT_BUTTON',
  'REDDIT_COMPOSE_NEW_BUTTON',
  'REDDIT_COMPOSE_REPLY_BUTTON',
  'REDDIT_REFINE_DRAFT_BUTTON',
  'DISCORD_COMPOSE_REPLY_BUTTON',
  'DISCORD_REFINE_DRAFT_BUTTON',
  'SEARCH_WITH_AI_CLAUDE',
  'SEARCH_WITH_AI_CHATGPT',
  'SIDEBAR_SEARCH_WITH_AI',
  'SIDEBAR_ART_AND_IMAGES',
] as const

export type PermissionWrapperCardSceneType = typeof PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST[number]

export type PermissionWrapperCardType = {
  sceneType: PermissionWrapperCardSceneType
  imageUrl?: string
  videoUrl?: string
  title: React.ReactNode
  description: React.ReactNode
  ctaButtonText: React.ReactNode
  ctaButtonLink?: string
  ctaButtonOnClick?: (event: React.MouseEvent) => void
}

export type PermissionWrapperI18nCardType = {
  imageUrl?: string
  videoUrl?: string
  title: (t: TFunction<['common', 'client']>) => React.ReactNode
  description: (t: TFunction<['common', 'client']>) => React.ReactNode
  ctaButtonText: (t: TFunction<['common', 'client']>) => React.ReactNode
  ctaButtonLink?: string
  ctaButtonOnClick?: (event: React.MouseEvent) => void
}

export const formatTimeStampToHoursAndMinutes = (timestamp?: number) => {
  const currentTime = new Date().getTime()
  let nextTime = timestamp
  if (!nextTime) {
    nextTime = dayjs().utc().add(1, 'days').startOf('days').unix()
  }
  const diff = nextTime * 1000 - currentTime
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  return `${hours} hours and ${minutes} minutes`
}

export const isPermissionCardSceneType = (
  sceneType: string,
): sceneType is PermissionWrapperCardSceneType => {
  return Object.keys(PERMISSION_CARD_SETTINGS_TEMPLATE).includes(sceneType)
}
export const getPermissionCardSettingsBySceneType = (
  sceneType: PermissionWrapperCardSceneType,
): PermissionWrapperI18nCardType => {
  return {
    ctaButtonLink: `${APP_USE_CHAT_GPT_HOST}/pricing`,
    ...PERMISSION_CARD_SETTINGS_TEMPLATE[sceneType],
  }
}

export const PERMISSION_CARD_SETTINGS_TEMPLATE: {
  [key in PermissionWrapperCardSceneType]: PermissionWrapperI18nCardType
} = {
  // 聊天每日限制
  TOTAL_CHAT_DAILY_LIMIT: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/unlimited-ai-requests.png',
    )}`,
    title: (t) => t('client:permission__pricing_hook__daily_limit__title'),
    description: (t) => {
      return `${t(
        'client:permission__pricing_hook__daily_limit__description1',
      )}`
    },
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // 自定义prompt
  CUSTOM_PROMPT: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/custom-prompt.png',
    )}`,
    title: (t) => t('client:permission__pricing_hook__custom_prompt__title'),
    description: (t) =>
      t('client:permission__pricing_hook__custom_prompt__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // 自定义prompt
  CUSTOM_PROMPT_GROUP: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/custom-prompt-group.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__custom_prompt_group__title'),
    description: (t) =>
      t('client:permission__pricing_hook__custom_prompt_group__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Gmail cta button - compose new
  GMAIL_DRAFT_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-email.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__compose_new__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__compose_new__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Gmail cta button - compose reply
  GMAIL_REPLY_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-email.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Gmail dropdown button - refine draft
  GMAIL_CONTEXT_MENU: {
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-email.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // AI response language
  AI_RESPONSE_LANGUAGE: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-response-language.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__ai_response_language__title'),
    description: (t) =>
      t('client:permission__pricing_hook__ai_response_language__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // ChatGPT Stable mode
  CHATGPT_STABLE_MODE: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/chatgpt-stable-mode.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__chatgpt_stable_mode__title'),
    description: (t) =>
      t('client:permission__pricing_hook__chatgpt_stable_mode__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // pdf ai viewer
  PDF_AI_VIEWER: {
    imageUrl: `${getChromeExtensionAssetsURL('/images/upgrade/pdf.png')}`,
    videoUrl: `https://www.youtube.com/embed/eYO5Dh6Ruic`,
    title: (t) => t('client:permission__pricing_hook__pdf_ai_viewer__title'),
    description: (t) =>
      t('client:permission__pricing_hook__pdf_ai_viewer__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Preferred language
  PREFERRED_LANGUAGE: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/preferred-language.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__preferred_language__title'),
    description: (t) =>
      t('client:permission__pricing_hook__preferred_language__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - temperature
  MAXAI_CHATGPT_TEMPERATURE: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-temperature.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__max_ai_temperature__title'),
    description: (t) =>
      t('client:permission__pricing_hook__max_ai_temperature__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - paid model - gpt3.5 16k
  MAXAI_PAID_MODEL_GPT3_5_16K: {
    videoUrl: `https://www.youtube.com/embed/QA4gxm3xtLE`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt3-5-16k.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gpt3_5_16k__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gpt3_5_16k__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - paid model - gpt4
  MAXAI_PAID_MODEL_GPT4: {
    videoUrl: 'https://www.youtube.com/embed/mAi1D9cbGos',
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt4.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__max_ai_paid_model__gpt4__title'),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gpt4__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - paid model - gpt4-turbo
  MAXAI_PAID_MODEL_GPT4_TURBO: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt4.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__max_ai_paid_model__gpt4__title'),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gpt4__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - paid model - gpt4V
  MAXAI_PAID_MODEL_GPT4_VISION: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt4-vision.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gpt4_vision__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gpt4_vision__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - paid model - gpt3.5
  MAXAI_PAID_MODEL_GPT3_5: {
    videoUrl: 'https://www.youtube.com/embed/zgq2DKlwEYk',
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt3-5.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__max_ai_paid_model__gpt3_5__title'),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gpt3_5__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // page summary
  PAGE_SUMMARY: {
    videoUrl: 'https://www.youtube.com/embed/72UM1jMaJhY',
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/page-summary.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__page_summary__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__page_summary__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - paid model - calude - instant-v1-100k
  MAXAI_PAID_MODEL_CLAUDE_INSTANT_V1: {
    videoUrl: 'https://www.youtube.com/embed/qwFVrq3Epcs',
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-instant-100k.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_instant_v1__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_instant_v1__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - paid model - calude - instant-v2
  MAXAI_PAID_MODEL_CLAUDE_V2: {
    videoUrl: 'https://www.youtube.com/embed/3hHrqmIU284',
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-2-100k.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__max_ai_paid_model__claude_v2__title'),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_v2__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - paid model - calude - instant-v2-1
  MAXAI_PAID_MODEL_CLAUDE_V2_1: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-2.1-200k.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_v2_1__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_v2_1__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_elite'),
  },
  // MAX AI - paid model - calude - 3 haiku
  MAXAI_PAID_MODEL_CLAUDE_V3_HAIKU: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-3-haiku.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_v3_haiku__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_v3_haiku__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_elite'),
  },
  // MAX AI - paid model - calude - 3 sonnet
  MAXAI_PAID_MODEL_CLAUDE_V3_SONNET: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-3-sonnet.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_v3_sonnet__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_v3_sonnet__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_elite'),
  },
  // MAX AI - paid model - calude - 3 opus
  MAXAI_PAID_MODEL_CLAUDE_V3_OPUS: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-3-opus.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_v3_opus__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__claude_v3_opus__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_elite'),
  },
  MAXAI_PAID_MODEL_GEMINI_PRO: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gemini-pro.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gemini_pro__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gemini_pro__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_elite'),
  },
  // Outlook cta button - compose new
  OUTLOOK_COMPOSE_NEW_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/Y2yZ4wWQDno`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-email.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__compose_new__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__compose_new__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Outlook cta button - compose reply
  OUTLOOK_COMPOSE_REPLY_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/Y2yZ4wWQDno`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-email.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Outlook dropdown button - refine draft
  OUTLOOK_REFINE_DRAFT_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/Y2yZ4wWQDno`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-email.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__email__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Twitter cta button - compose new
  TWITTER_COMPOSE_NEW_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/3UQaOm8sWVI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Twitter cta button - compose reply
  TWITTER_COMPOSE_REPLY_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/3UQaOm8sWVI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Twitter dropdown button - refine draft
  TWITTER_REFINE_DRAFT_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/3UQaOm8sWVI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // linkedin cta button - compose new
  LINKEDIN_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // linkedin cta button - compose reply
  LINKEDIN_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // linkedin dropdown button - refine draft
  LINKEDIN_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Facebook cta button - compose new
  FACEBOOK_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Facebook cta button - compose reply
  FACEBOOK_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Facebook dropdown button - refine draft
  FACEBOOK_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // YouTube cta button - compose new
  YOUTUBE_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // YouTube cta button - compose reply
  YOUTUBE_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // YouTube dropdown button - refine draft
  YOUTUBE_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Instagram cta button - compose new
  INSTAGRAM_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Instagram cta button - compose reply
  INSTAGRAM_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Instagram dropdown button - refine draft
  INSTAGRAM_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Search with AI - Claude
  SEARCH_WITH_AI_CLAUDE: {
    videoUrl: 'https://www.youtube.com/embed/qwFVrq3Epcs',
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-instant-100k.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__search_with_ai_claude__title'),
    description: (t) =>
      t('client:permission__pricing_hook__search_with_ai_claude__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Search with AI - ChatGPt
  SEARCH_WITH_AI_CHATGPT: {
    videoUrl: 'https://www.youtube.com/embed/zgq2DKlwEYk',
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt3-5.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__search_with_ai_chatgpt__title'),
    description: (t) =>
      t('client:permission__pricing_hook__search_with_ai_chatgpt__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  SIDEBAR_SEARCH_WITH_AI: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/search-with-ai.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__search_with_ai__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__search_with_ai__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  SIDEBAR_ART_AND_IMAGES: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/maxai-art-and-images.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__max_ai_paid_model__maxai_art__title'),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__maxai_art__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_elite'),
  },
  // Reddit cta button - compose new
  REDDIT_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_new__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Reddit cta button - compose reply
  REDDIT_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Reddit dropdown button - refine draft
  REDDIT_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__social_media__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  DISCORD_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  DISCORD_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-social-media.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
}
