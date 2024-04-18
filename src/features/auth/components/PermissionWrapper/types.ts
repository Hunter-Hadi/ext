import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import React from 'react'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

export const PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST = [
  'TOTAL_CHAT_DAILY_LIMIT',
  'CUSTOM_PROMPT',
  'PREFERRED_LANGUAGE',
  'PAGE_SUMMARY',
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
  'SLACK_COMPOSE_REPLY_BUTTON',
  'SLACK_REFINE_DRAFT_BUTTON',
  'WHATSAPP_COMPOSE_REPLY_BUTTON',
  'WHATSAPP_REFINE_DRAFT_BUTTON',
  'SEARCH_WITH_AI_CLAUDE',
  'SEARCH_WITH_AI_CHATGPT',
  'SIDEBAR_SEARCH_WITH_AI',
  'SIDEBAR_ART_AND_IMAGES',

  /**
   * @deprecated 将一些付费功能免费开放  - 2024-04-16
   *
   * PRD: https://ikjt09m6ta.larksuite.com/docx/RthLdgs0toL462xZqP3uYLvCsFb#PIHtdlZ3GoIoV5xvSOEuAgBdsgf
   *
   * 以下都是已被弃用的 sceneType
   */
  'AI_RESPONSE_LANGUAGE',
  'CHATGPT_STABLE_MODE',
  'MAXAI_CHATGPT_TEMPERATURE',
  'PDF_AI_VIEWER',
  'MAXAI_PAID_MODEL_CLAUDE_INSTANT_V1',
  'MAXAI_PAID_MODEL_CLAUDE_V2',
  'MAXAI_PAID_MODEL_CLAUDE_V2_1',
  'MAXAI_PAID_MODEL_CLAUDE_V3_HAIKU',
  'MAXAI_PAID_MODEL_CLAUDE_V3_SONNET',
  'MAXAI_PAID_MODEL_CLAUDE_V3_OPUS',
  'MAXAI_PAID_MODEL_GEMINI_PRO',
  'MAXAI_PAID_MODEL_GEMINI_1_5_PRO',
  'MAXAI_PAID_MODEL_GPT3_5',
  'MAXAI_PAID_MODEL_GPT3_5_16K',
  'MAXAI_PAID_MODEL_GPT4',
  'MAXAI_PAID_MODEL_GPT4_TURBO',
  'MAXAI_PAID_MODEL_GPT4_VISION',
] as const

export type PermissionWrapperCardSceneType =
  (typeof PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST)[number]

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

export const isUsageLimitPermissionSceneType = (sceneType: string): boolean => {
  const API_RESPONSE_USAGE_LIMIT_SCENE_TYPES = [
    'MAXAI_ADVANCED_MODEL',
    'MAXAI_FAST_TEXT_MODEL',
    'MAXAI_IMAGE_MODEL',
    'TOTAL_CHAT_DAILY_LIMIT',
  ]
  if (API_RESPONSE_USAGE_LIMIT_SCENE_TYPES.includes(sceneType)) {
    // 由于 不同模型的用量上限卡点的报错值 是后端直接返回的
    // 需要前端统一成 TOTAL_CHAT_DAILY_LIMIT
    return true
  }
  return false
}

export const isPermissionCardSceneType = (
  sceneType: string,
): sceneType is PermissionWrapperCardSceneType => {
  if (isUsageLimitPermissionSceneType(sceneType)) {
    return true
  }
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
  // 不同模型用量上限的 pricing hook
  TOTAL_CHAT_DAILY_LIMIT: {
    // imageUrl: `${getChromeExtensionAssetsURL(
    //   '/images/upgrade/unlimited-ai-requests.png',
    // )}`,
    title: (t) => t('client:permission__pricing_hook__daily_limit__title'),
    description: (t) => {
      return `${t(
        'client:permission__pricing_hook__daily_limit__description1',
      )}`
    },
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Gmail cta button - compose new
  GMAIL_DRAFT_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Gmail cta button - compose reply
  GMAIL_REPLY_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Gmail dropdown button - refine draft
  GMAIL_CONTEXT_MENU: {
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // AI response language
  // @deprecated
  AI_RESPONSE_LANGUAGE: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-response-language.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__ai_response_language__title'),
    description: (t) =>
      t('client:permission__pricing_hook__ai_response_language__description'),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // ChatGPT Stable mode
  // @deprecated
  CHATGPT_STABLE_MODE: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/chatgpt-stable-mode.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__chatgpt_stable_mode__title'),
    description: (t) =>
      t('client:permission__pricing_hook__chatgpt_stable_mode__description'),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // pdf ai viewer
  // @deprecated
  PDF_AI_VIEWER: {
    imageUrl: `${getChromeExtensionAssetsURL('/images/upgrade/pdf.png')}`,
    videoUrl: `https://www.youtube.com/embed/eYO5Dh6Ruic`,
    title: (t) => t('client:permission__pricing_hook__pdf_ai_viewer__title'),
    description: (t) =>
      t('client:permission__pricing_hook__pdf_ai_viewer__description'),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - temperature
  // @deprecated
  MAXAI_CHATGPT_TEMPERATURE: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-temperature.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__max_ai_temperature__title'),
    description: (t) =>
      t('client:permission__pricing_hook__max_ai_temperature__description'),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - gpt3.5 16k
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - gpt4
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - gpt4-turbo
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - gpt4V
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - calude - instant-v1-100k
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - calude - instant-v2
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - calude - instant-v2-1
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - calude - 3 haiku
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - calude - 3 sonnet
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // MAX AI - paid model - calude - 3 opus
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // @deprecated
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // @deprecated
  MAXAI_PAID_MODEL_GEMINI_1_5_PRO: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gemini-1-5-pro.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gemini_1_5_pro__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gemini_1_5_pro__description',
      ),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Outlook cta button - compose new
  OUTLOOK_COMPOSE_NEW_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/Y2yZ4wWQDno`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Outlook cta button - compose reply
  OUTLOOK_COMPOSE_REPLY_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/Y2yZ4wWQDno`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Outlook dropdown button - refine draft
  OUTLOOK_REFINE_DRAFT_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/Y2yZ4wWQDno`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Twitter cta button - compose new
  TWITTER_COMPOSE_NEW_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/3UQaOm8sWVI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Twitter cta button - compose reply
  TWITTER_COMPOSE_REPLY_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/3UQaOm8sWVI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Twitter dropdown button - refine draft
  TWITTER_REFINE_DRAFT_BUTTON: {
    videoUrl: `https://www.youtube.com/embed/3UQaOm8sWVI`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // linkedin cta button - compose new
  LINKEDIN_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // linkedin cta button - compose reply
  LINKEDIN_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // linkedin dropdown button - refine draft
  LINKEDIN_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Facebook cta button - compose new
  FACEBOOK_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Facebook cta button - compose reply
  FACEBOOK_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Facebook dropdown button - refine draft
  FACEBOOK_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // YouTube cta button - compose new
  YOUTUBE_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // YouTube cta button - compose reply
  YOUTUBE_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // YouTube dropdown button - refine draft
  YOUTUBE_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Instagram cta button - compose new
  INSTAGRAM_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Instagram cta button - compose reply
  INSTAGRAM_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Instagram dropdown button - refine draft
  INSTAGRAM_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Reddit cta button - compose new
  REDDIT_COMPOSE_NEW_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Reddit cta button - compose reply
  REDDIT_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Reddit dropdown button - refine draft
  REDDIT_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-chat-app-website.png',
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
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Discord cta button - compose reply
  DISCORD_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-chat-app-website.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Discord dropdown button - refine draft
  DISCORD_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-chat-app-website.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Slack cta button - compose reply
  SLACK_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-chat-app-website.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // Slack dropdown button - refine draft
  SLACK_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-chat-app-website.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // WhatsApp cta button - compose reply
  WHATSAPP_COMPOSE_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-chat-app-website.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__compose_reply__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__compose_reply__description',
      ),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
  // WhatsApp dropdown button - refine draft
  WHATSAPP_REFINE_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/input-assistant-chat-app-website.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__refine_draft__title',
      ),
    description: (t) =>
      t(
        'client:permission__pricing_hook__input_assistant_button__chat_app__refine_draft__description',
      ),
    ctaButtonText: (t) =>
      t('client:sidebar__button__upgrade_to_plan', { PLAN: 'Elite' }),
  },
}
