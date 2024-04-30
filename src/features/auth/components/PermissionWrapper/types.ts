import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import React from 'react'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

export const PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST = [
  'MAXAI_FAST_TEXT_MODEL',
  'MAXAI_ADVANCED_MODEL',
  'MAXAI_IMAGE_GENERATE_MODEL',
  'MAXAI_INSTANT_REPLY',
  'MAXAI_FAST_TEXT_MODEL_GPT_3_5_TURBO',
  'MAXAI_FAST_TEXT_MODEL_CLAUDE_3_HAIKU',
  'MAXAI_FAST_TEXT_MODEL_GEMINI_PRO',
  'MAXAI_ADVANCED_MODEL_GPT_4_TURBO',
  'MAXAI_ADVANCED_MODEL_CLAUDE_3_OPUS',
  'MAXAI_ADVANCED_MODEL_CLAUDE_3_SONNET',
  'MAXAI_ADVANCED_MODEL_GEMINI_1_5_PRO',
  'MAXAI_ADVANCED_MODEL_GPT_4',
  'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT',
  'PAGE_SUMMARY',
  'SIDEBAR_SEARCH_WITH_AI',
  'SIDEBAR_ART_AND_IMAGES',
  'SEARCH_WITH_AI_CLAUDE',
  'SEARCH_WITH_AI_CHATGPT',
  'SEARCH_WITH_AI_HIGH_TRAFFIC',

  /**
   * @deprecated 统一为: MAXAI_INSTANT_REPLY - 2024-04-30
   * @inheritDoc - https://ikjt09m6ta.larksuite.com/docx/LbLfdXGfWo0naAxPTh1u8XkSs5b
   */
  // 'GMAIL_DRAFT_BUTTON',
  // 'GMAIL_REPLY_BUTTON',
  // 'GMAIL_CONTEXT_MENU',
  // 'OUTLOOK_COMPOSE_NEW_BUTTON',
  // 'OUTLOOK_COMPOSE_REPLY_BUTTON',
  // 'OUTLOOK_REFINE_DRAFT_BUTTON',
  // 'TWITTER_COMPOSE_NEW_BUTTON',
  // 'TWITTER_COMPOSE_REPLY_BUTTON',
  // 'TWITTER_REFINE_DRAFT_BUTTON',
  // 'LINKEDIN_COMPOSE_NEW_BUTTON',
  // 'LINKEDIN_COMPOSE_REPLY_BUTTON',
  // 'LINKEDIN_REFINE_DRAFT_BUTTON',
  // 'FACEBOOK_COMPOSE_NEW_BUTTON',
  // 'FACEBOOK_COMPOSE_REPLY_BUTTON',
  // 'FACEBOOK_REFINE_DRAFT_BUTTON',
  // 'YOUTUBE_COMPOSE_NEW_BUTTON',
  // 'YOUTUBE_COMPOSE_REPLY_BUTTON',
  // 'YOUTUBE_REFINE_DRAFT_BUTTON',
  // 'INSTAGRAM_COMPOSE_NEW_BUTTON',
  // 'INSTAGRAM_COMPOSE_REPLY_BUTTON',
  // 'INSTAGRAM_REFINE_DRAFT_BUTTON',
  // 'REDDIT_COMPOSE_NEW_BUTTON',
  // 'REDDIT_COMPOSE_REPLY_BUTTON',
  // 'REDDIT_REFINE_DRAFT_BUTTON',
  // 'DISCORD_COMPOSE_REPLY_BUTTON',
  // 'DISCORD_REFINE_DRAFT_BUTTON',
  // 'SLACK_COMPOSE_REPLY_BUTTON',
  // 'SLACK_REFINE_DRAFT_BUTTON',
  // 'WHATSAPP_COMPOSE_REPLY_BUTTON',
  // 'WHATSAPP_REFINE_DRAFT_BUTTON',
  // 'TELEGRAM_COMPOSE_REPLY_BUTTON',
  // 'TELEGRAM_REFINE_DRAFT_BUTTON',
  // 'MESSENGER_COMPOSE_REPLY_BUTTON',
  // 'MESSENGER_REFINE_DRAFT_BUTTON',
  /**
   * @deprecated 将一些付费功能免费开放  - 2024-04-16
   *
   * PRD: https://ikjt09m6ta.larksuite.com/docx/RthLdgs0toL462xZqP3uYLvCsFb#PIHtdlZ3GoIoV5xvSOEuAgBdsgf
   *
   * 以下都是已被弃用的 sceneType
   */
  // 'CUSTOM_PROMPT_GROUP',
  // 'PREFERRED_LANGUAGE',
  // 'CUSTOM_PROMPT',
  // 'AI_RESPONSE_LANGUAGE',
  // 'CHATGPT_STABLE_MODE',
  // 'MAXAI_CHATGPT_TEMPERATURE',
  // 'PDF_AI_VIEWER',
  // 'MAXAI_PAID_MODEL_CLAUDE_INSTANT_V1',
  // 'MAXAI_PAID_MODEL_CLAUDE_V2',
  // 'MAXAI_PAID_MODEL_CLAUDE_V2_1',
  // 'MAXAI_PAID_MODEL_CLAUDE_V3_HAIKU',
  // 'MAXAI_PAID_MODEL_CLAUDE_V3_SONNET',
  // 'MAXAI_PAID_MODEL_CLAUDE_V3_OPUS',
  // 'MAXAI_PAID_MODEL_GEMINI_PRO',
  // 'MAXAI_PAID_MODEL_GEMINI_1_5_PRO',
  // 'MAXAI_PAID_MODEL_GPT3_5',
  // 'MAXAI_PAID_MODEL_GPT3_5_16K',
  // 'MAXAI_PAID_MODEL_GPT4',
  // 'MAXAI_PAID_MODEL_GPT4_TURBO',
  // 'MAXAI_PAID_MODEL_GPT4_VISION',
] as const

export type PermissionWrapperCardSceneType =
  (typeof PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST)[number]

export type PermissionWrapperCardType = {
  sceneType: PermissionWrapperCardSceneType
  imageUrl?: string
  videoUrl?: string
  title: React.ReactNode
  description: React.ReactNode
  ctaButtonText?: React.ReactNode
  ctaButtonLink?: string
  ctaButtonOnClick?: (event: React.MouseEvent) => void
}

export type PermissionWrapperI18nCardType = {
  imageUrl?: string
  videoUrl?: string
  title: (
    t: TFunction<['common', 'client']>,
    isFreeUser?: boolean,
  ) => React.ReactNode
  description: (
    t: TFunction<['common', 'client']>,
    isFreeUser?: boolean,
  ) => React.ReactNode
  ctaButtonText?: (t: TFunction<['common', 'client']>) => React.ReactNode
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
    'MAXAI_IMAGE_GENERATE_MODEL',
    'MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT',
  ]
  if (API_RESPONSE_USAGE_LIMIT_SCENE_TYPES.includes(sceneType)) {
    // 由于 不同模型的用量上限卡点的报错值 是后端直接返回的
    return true
  }
  return false
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
  // 不同模型用量上限的 pricing hook
  MAXAI_THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT: {
    title: (t) => t('client:permission__pricing_hook__3rd_party_usage__title'),
    description: (t, isFreeUser) => {
      return `${t(
        'client:permission__pricing_hook__3rd_party_usage__description',
      )}`
    },
  },
  MAXAI_FAST_TEXT_MODEL: {
    title: (t) => t('client:permission__pricing_hook__fast_text_usage__title'),
    description: (t, isFreeUser) => {
      return `${t(
        isFreeUser
          ? 'client:permission__pricing_hook__fast_text_usage__free__description'
          : 'client:permission__pricing_hook__fast_text_usage__paid__description',
      )}`
    },
  },
  MAXAI_FAST_TEXT_MODEL_GPT_3_5_TURBO: {
    videoUrl: `https://www.youtube.com/embed/zgq2DKlwEYk`,
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt-3-5-turbo.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__fast_text_usage__gpt_3_5_turbo__title',
      ),
    description: (t, isFreeUser) => {
      return [
        `${t(
          isFreeUser
            ? 'client:permission__pricing_hook__fast_text_usage__gpt_3_5_turbo__free__description1'
            : 'client:permission__pricing_hook__fast_text_usage__gpt_3_5_turbo__paid__description1',
        )}`,
        `${t(
          'client:permission__pricing_hook__fast_text_usage__gpt_3_5_turbo__description2',
        )}`,
      ].join('\n')
    },
  },
  MAXAI_FAST_TEXT_MODEL_CLAUDE_3_HAIKU: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-3-haiku.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__fast_text_usage__claude_3_haiku__title',
      ),
    description: (t, isFreeUser) => {
      return [
        `${t(
          isFreeUser
            ? 'client:permission__pricing_hook__fast_text_usage__claude_3_haiku__free__description1'
            : 'client:permission__pricing_hook__fast_text_usage__claude_3_haiku__paid__description1',
        )}`,
        `${t(
          'client:permission__pricing_hook__fast_text_usage__claude_3_haiku__description2',
        )}`,
      ].join('\n')
    },
  },
  MAXAI_FAST_TEXT_MODEL_GEMINI_PRO: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gemini-pro.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__fast_text_usage__gemini_pro__title'),
    description: (t, isFreeUser) => {
      return [
        `${t(
          isFreeUser
            ? 'client:permission__pricing_hook__fast_text_usage__gemini_pro__free__description1'
            : 'client:permission__pricing_hook__fast_text_usage__gemini_pro__paid__description1',
        )}`,
        `${t(
          'client:permission__pricing_hook__fast_text_usage__gemini_pro__description2',
        )}`,
      ].join('\n')
    },
  },
  MAXAI_ADVANCED_MODEL: {
    title: (t) =>
      t('client:permission__pricing_hook__advanced_text_usage__title'),
    description: (t, isFreeUser) => {
      return `${t(
        isFreeUser
          ? 'client:permission__pricing_hook__advanced_text_usage__free__description'
          : 'client:permission__pricing_hook__advanced_text_usage__paid__description',
      )}`
    },
  },
  MAXAI_ADVANCED_MODEL_GPT_4_TURBO: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt-4-turbo.png',
    )}`,

    title: (t) =>
      t(
        'client:permission__pricing_hook__advanced_text_usage__gpt_4_turbo__title',
      ),
    description: (t, isFreeUser) => {
      if (isFreeUser) {
        return [
          `${t(
            'client:permission__pricing_hook__advanced_text_usage__gpt_4_turbo__description2',
          )}`,
        ].join('\n')
      }
      return [
        `${t(
          'client:permission__pricing_hook__advanced_text_usage__gpt_4_turbo__paid__description1',
        )}`,
        `${t(
          'client:permission__pricing_hook__advanced_text_usage__gpt_4_turbo__description2',
        )}`,
      ].join('\n')
    },
  },
  MAXAI_ADVANCED_MODEL_CLAUDE_3_OPUS: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-3-opus.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__advanced_text_usage__claude_3_opus__title',
      ),
    description: (t, isFreeUser) => {
      return [
        `${t(
          'client:permission__pricing_hook__advanced_text_usage__claude_3_opus__description1',
        )}`,
      ].join('\n')
    },
  },
  MAXAI_ADVANCED_MODEL_CLAUDE_3_SONNET: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-3-sonnet.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__advanced_text_usage__claude_3_sonnet__title',
      ),
    description: (t, isFreeUser) => {
      return [
        `${t(
          'client:permission__pricing_hook__advanced_text_usage__claude_3_sonnet__description1',
        )}`,
      ].join('\n')
    },
  },
  MAXAI_ADVANCED_MODEL_GEMINI_1_5_PRO: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gemini-1-5-pro.png',
    )}`,
    title: (t) =>
      t(
        'client:permission__pricing_hook__advanced_text_usage__gemini_1_5_pro__title',
      ),
    description: (t, isFreeUser) => {
      return [
        `${t(
          'client:permission__pricing_hook__advanced_text_usage__gemini_1_5_pro__description1',
        )}`,
      ].join('\n')
    },
  },
  MAXAI_ADVANCED_MODEL_GPT_4: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt-4.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__advanced_text_usage__gpt_4__title'),
    description: (t, isFreeUser) => {
      if (isFreeUser) {
        return [
          `${t(
            'client:permission__pricing_hook__advanced_text_usage__gpt_4__description2',
          )}`,
        ].join('\n')
      }
      return [
        `${t(
          'client:permission__pricing_hook__advanced_text_usage__gpt_4__paid__description1',
        )}`,
        `${t(
          'client:permission__pricing_hook__advanced_text_usage__gpt_4__description2',
        )}`,
      ].join('\n')
    },
  },
  MAXAI_INSTANT_REPLY: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/ai-instant-reply',
    )}`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  MAXAI_IMAGE_GENERATE_MODEL: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/maxai-art-and-images.png',
    )}`,

    title: (t) => t('client:permission__pricing_hook__image_usage__title'),
    description: (t, isFreeUser) => {
      return `${t(
        isFreeUser
          ? 'client:permission__pricing_hook__image_usage__description__for_free'
          : 'client:permission__pricing_hook__image_usage__description__for_paying',
      )}`
    },
  },
  // page summary
  PAGE_SUMMARY: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/page-summary.png',
    )}`,
    videoUrl: `https://www.youtube.com/embed/72UM1jMaJhY`,
    title: (t) => t('client:permission__pricing_hook__ai_summary__title'),
    description: (t) =>
      t('client:permission__pricing_hook__ai_summary__description'),
  },
  // Search with AI - Claude
  SEARCH_WITH_AI_CLAUDE: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/claude-3-haiku.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__search_with_ai_claude__title'),
    description: (t) =>
      t('client:permission__pricing_hook__search_with_ai_claude__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_now'),
    ctaButtonLink: `${APP_USE_CHAT_GPT_HOST}/pricing`,
  },
  // Search with AI - ChatGPt
  SEARCH_WITH_AI_CHATGPT: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt-3-5-turbo.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__search_with_ai_chatgpt__title'),
    description: (t) =>
      t('client:permission__pricing_hook__search_with_ai_chatgpt__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_now'),
    ctaButtonLink: `${APP_USE_CHAT_GPT_HOST}/pricing`,
  },
  SEARCH_WITH_AI_HIGH_TRAFFIC: {
    title: (t) =>
      t('client:permission__pricing_hook__SEARCH_WITH_AI_HIGH_TRAFFIC__title'),
    description: (t) =>
      t(
        'client:permission__pricing_hook__SEARCH_WITH_AI_HIGH_TRAFFIC__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_now'),
    ctaButtonLink: `${APP_USE_CHAT_GPT_HOST}/pricing`,
  },
  SIDEBAR_SEARCH_WITH_AI: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/search-with-ai.png',
    )}`,
    videoUrl: `https://www.youtube.com/embed/1uZuyqqySO0`,
    title: (t) => t('client:permission__pricing_hook__ai_search__title'),
    description: (t) =>
      t('client:permission__pricing_hook__ai_search__description'),
  },
  SIDEBAR_ART_AND_IMAGES: {
    title: (t) => t('client:permission__pricing_hook__image_usage__title'),
    description: (t, isFreeUser) => {
      return `${t(
        isFreeUser
          ? 'client:permission__pricing_hook__image_usage__description__for_free'
          : 'client:permission__pricing_hook__image_usage__description__for_paying',
      )}`
    },
  },
}
