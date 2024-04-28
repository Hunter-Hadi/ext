import dayjs from 'dayjs'
import { TFunction } from 'i18next'
import React from 'react'

import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { IPermissionPricingHookCardType } from '@/features/auth/components/PermissionPricingHookCard/types'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

export const PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST = [
  'THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT',
  'MAXAI_FAST_TEXT_MODEL',
  'MAXAI_ADVANCED_MODEL',
  'MAXAI_IMAGE_GENERATE_MODEL',
  'PAGE_SUMMARY',
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
  'TELEGRAM_COMPOSE_REPLY_BUTTON',
  'TELEGRAM_REFINE_DRAFT_BUTTON',
  'MESSENGER_COMPOSE_REPLY_BUTTON',
  'MESSENGER_REFINE_DRAFT_BUTTON',
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
  pricingHookCardType?: IPermissionPricingHookCardType // pricing hook card 渲染类型的声明
  imageUrl?: string
  videoUrl?: string
  title: React.ReactNode
  description: React.ReactNode
  ctaButtonText?: React.ReactNode
  ctaButtonLink?: string
  ctaButtonOnClick?: (event: React.MouseEvent) => void
}

export type PermissionWrapperI18nCardType = {
  pricingHookCardType?: IPermissionPricingHookCardType // pricing hook card 渲染类型的声明
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
    'THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT',
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
  THIRD_PARTY_PROVIDER_CHAT_DAILY_LIMIT: {
    pricingHookCardType: 'FAST_TEXT_MODEL',
    title: (t) => t('client:permission__pricing_hook__fast_text_usage__title'),
    description: (t, isFreeUser) => {
      return `${t(
        isFreeUser
          ? 'client:permission__pricing_hook__fast_text_usage__description__for_free'
          : 'client:permission__pricing_hook__fast_text_usage__description__for_paying',
      )}`
    },
  },
  MAXAI_FAST_TEXT_MODEL: {
    pricingHookCardType: 'FAST_TEXT_MODEL',
    title: (t) => t('client:permission__pricing_hook__fast_text_usage__title'),
    description: (t, isFreeUser) => {
      return `${t(
        isFreeUser
          ? 'client:permission__pricing_hook__fast_text_usage__description__for_free'
          : 'client:permission__pricing_hook__fast_text_usage__description__for_paying',
      )}`
    },
  },
  MAXAI_ADVANCED_MODEL: {
    pricingHookCardType: 'ADVANCED_MODEL',
    title: (t) =>
      t('client:permission__pricing_hook__advanced_text_usage__title'),
    description: (t, isFreeUser) => {
      return `${t(
        isFreeUser
          ? 'client:permission__pricing_hook__advanced_text_usage__description__for_free'
          : 'client:permission__pricing_hook__advanced_text_usage__description__for_paying',
      )}`
    },
  },
  MAXAI_IMAGE_GENERATE_MODEL: {
    pricingHookCardType: 'IMAGE_MODEL',
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
    pricingHookCardType: 'AI_SUMMARY',
    videoUrl: `https://www.youtube.com/embed/72UM1jMaJhY`,
    title: (t) => t('client:permission__pricing_hook__ai_summary__title'),
    description: (t) =>
      t('client:permission__pricing_hook__ai_summary__description'),
  },
  // Gmail cta button - compose new
  GMAIL_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Gmail cta button - compose reply
  GMAIL_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Gmail dropdown button - refine draft
  GMAIL_CONTEXT_MENU: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Outlook cta button - compose new
  OUTLOOK_COMPOSE_NEW_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Outlook cta button - compose reply
  OUTLOOK_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Outlook dropdown button - refine draft
  OUTLOOK_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Twitter cta button - compose new
  TWITTER_COMPOSE_NEW_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Twitter cta button - compose reply
  TWITTER_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Twitter dropdown button - refine draft
  TWITTER_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // linkedin cta button - compose new
  LINKEDIN_COMPOSE_NEW_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // linkedin cta button - compose reply
  LINKEDIN_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // linkedin dropdown button - refine draft
  LINKEDIN_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Facebook cta button - compose new
  FACEBOOK_COMPOSE_NEW_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Facebook cta button - compose reply
  FACEBOOK_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Facebook dropdown button - refine draft
  FACEBOOK_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // YouTube cta button - compose new
  YOUTUBE_COMPOSE_NEW_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // YouTube cta button - compose reply
  YOUTUBE_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // YouTube dropdown button - refine draft
  YOUTUBE_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Instagram cta button - compose new
  INSTAGRAM_COMPOSE_NEW_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Instagram cta button - compose reply
  INSTAGRAM_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Instagram dropdown button - refine draft
  INSTAGRAM_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
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
  },
  // Search with AI - ChatGPt
  SEARCH_WITH_AI_CHATGPT: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/max-ai-paid-model-gpt3-5.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__search_with_ai_chatgpt__title'),
    description: (t) =>
      t('client:permission__pricing_hook__search_with_ai_chatgpt__description'),
  },
  SIDEBAR_SEARCH_WITH_AI: {
    pricingHookCardType: 'AI_SEARCH',
    videoUrl: `https://www.youtube.com/embed/1uZuyqqySO0`,
    title: (t) => t('client:permission__pricing_hook__ai_search__title'),
    description: (t) =>
      t('client:permission__pricing_hook__ai_search__description'),
  },
  SIDEBAR_ART_AND_IMAGES: {
    pricingHookCardType: 'IMAGE_MODEL',
    title: (t) => t('client:permission__pricing_hook__image_usage__title'),
    description: (t, isFreeUser) => {
      return `${t(
        isFreeUser
          ? 'client:permission__pricing_hook__image_usage__description__for_free'
          : 'client:permission__pricing_hook__image_usage__description__for_paying',
      )}`
    },
  },
  // Reddit cta button - compose new
  REDDIT_COMPOSE_NEW_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Reddit cta button - compose reply
  REDDIT_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Reddit dropdown button - refine draft
  REDDIT_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Discord cta button - compose reply
  DISCORD_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Discord dropdown button - refine draft
  DISCORD_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Slack cta button - compose reply
  SLACK_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Slack dropdown button - refine draft
  SLACK_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // WhatsApp cta button - compose reply
  WHATSAPP_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // WhatsApp dropdown button - refine draft
  WHATSAPP_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Telegram cta button - compose reply
  TELEGRAM_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Telegram dropdown button - refine draft
  TELEGRAM_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Messenger cta button - compose reply
  MESSENGER_COMPOSE_REPLY_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
  // Messenger dropdown button - refine draft
  MESSENGER_REFINE_DRAFT_BUTTON: {
    pricingHookCardType: 'INSTANT_REPLY',
    videoUrl: `https://www.youtube.com/embed/fwaqJyTwefI`,
    title: (t) => t('client:permission__pricing_hook__instant_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__instant_reply__description'),
  },
}
