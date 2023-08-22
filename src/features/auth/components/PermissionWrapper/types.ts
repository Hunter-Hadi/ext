import React from 'react'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { TFunction } from 'i18next'
import dayjs from 'dayjs'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'
import { IChatMessage, ISystemChatMessage } from '@/features/chatgpt/types'
import { v4 as uuidV4 } from 'uuid'

export const PERMISSION_WRAPPER_CARD_SCENE_TYPE_LIST = [
  'TOTAL_CHAT_DAILY_LIMIT',
  'CUSTOM_PROMPT',
  'CUSTOM_PROMPT_GROUP',
  'GMAIL_DRAFT_BUTTON',
  'GMAIL_REPLY_BUTTON',
  'GMAIL_CONTEXT_MENU',
  'AI_RESPONSE_LANGUAGE',
  'PDF_AI_VIEWER',
  'PREFERRED_LANGUAGE',
  'CHATGPT_STABLE_MODE',
  'MAXAI_CHATGPT_TEMPERATURE',
  'MAXAI_PAID_MODEL_GPT3_5',
  'MAXAI_PAID_MODEL_GPT3_5_16K',
  'MAXAI_PAID_MODEL_GPT4',
  'PAGE_SUMMARY',
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

export const isPermissionCardSceneType = (sceneType: string) => {
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
export const getPermissionCardMessageByPermissionCardSettings = (
  cardSettings: PermissionWrapperCardType,
): IChatMessage => {
  const needUpgradeMessage: ISystemChatMessage = {
    type: 'system',
    text: '',
    messageId: uuidV4(),
    parentMessageId: '',
    extra: {
      status: 'error',
      systemMessageType: 'needUpgrade',
      permissionSceneType: cardSettings.sceneType,
    },
  }
  const { title, description, imageUrl, videoUrl } = cardSettings
  let markdownText = `**${title}**\n${description}\n\n`
  if (imageUrl) {
    markdownText = `![${title}](${imageUrl})\n${markdownText}`
  } else if (videoUrl) {
    markdownText = `![${title}](${videoUrl})\n${markdownText}`
  }
  needUpgradeMessage.text = markdownText
  return needUpgradeMessage
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
  // Gmail cta button - 新邮件
  GMAIL_DRAFT_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/gmail-cta-button.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__gmail_cta_button_draft__title'),
    description: (t) =>
      t('client:permission__pricing_hook__gmail_cta_button_draft__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Gmail cta button - 回复邮件
  GMAIL_REPLY_BUTTON: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/gmail-cta-button.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__gmail_cta_button_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__gmail_cta_button_reply__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Gmail context menu
  GMAIL_CONTEXT_MENU: {
    imageUrl: `${getChromeExtensionAssetsURL(
      '/images/upgrade/gmail-context-menu.png',
    )}`,
    title: (t) =>
      t('client:permission__pricing_hook__gmail_context_menu__title'),
    description: (t) =>
      t('client:permission__pricing_hook__gmail_context_menu__description'),
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
  // MAX AI - paid model - gpt3.5
  MAXAI_PAID_MODEL_GPT3_5: {
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
}
