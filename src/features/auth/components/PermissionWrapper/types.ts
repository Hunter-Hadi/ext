import React from 'react'
import {
  APP_USE_CHAT_GPT_HOST,
  CHROME_EXTENSION_HOMEPAGE_URL,
} from '@/constants'
import { TFunction } from 'i18next'
import dayjs from 'dayjs'

export type PermissionWrapperCardSceneType =
  | 'CHAT_DAILY_LIMIT'
  | 'CUSTOM_PROMPT'
  | 'CUSTOM_PROMPT_GROUP'
  | 'GMAIL_CTA_DRAFT_BUTTON'
  | 'GMAIL_CTA_REPLY_BUTTON'
  | 'GMAIL_CONTEXT_MENU'
  | 'AI_RESPONSE_LANGUAGE'
  | 'CHATGPT_STABLE_MODE'
  | 'PDF_AI_VIEWER'
  | 'PREFERRED_LANGUAGE'
  | 'MAX_AI_TEMPERATURE'
  | 'MAX_AI_PAID_MODEL_GPT3_5_16K'
  | 'MAX_AI_PAID_MODEL_GPT4'

export type PermissionWrapperCardType = {
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

const formatTimeStampToHoursAndMinutes = (timestamp?: number) => {
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

export const PERMISSION_CARD_SETTINGS_TEMPLATE: {
  [key in PermissionWrapperCardSceneType]: PermissionWrapperI18nCardType
} = {
  // 聊天每日限制
  CHAT_DAILY_LIMIT: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/chat-daily-limit.png`,
    title: (t) => t('client:permission__pricing_hook__daily_limit__title'),
    description: (t) => {
      const next_reset_timestamp = formatTimeStampToHoursAndMinutes()
      // const template =
      //   `![upgrade to pro image](https://www.maxai.me/assets/chrome-extension/upgrade/unlimited-ai-requests.png)` +
      //   `You've reached the current daily usage cap. You can ` +
      //   `[upgrade to Pro](${APP_USE_CHAT_GPT_HOST}/pricing) ` +
      //   `now for unlimited usage, or try again in ${next_reset_timestamp}. ` +
      //   `[Learn more](${APP_USE_CHAT_GPT_HOST}/pricing)` +
      //   `\n\nIf you've already upgraded, reload the ` +
      //   `[My Plan](${APP_USE_CHAT_GPT_HOST}/my-plan)` +
      //   `page to activate your membership.`
      const textOfParts = [
        `![upgrade to pro image](https://www.maxai.me/assets/chrome-extension/upgrade/unlimited-ai-requests.png)`,
        `${t('client:permission__pricing_hook__daily_limit__description1')} `,
        `[${t(
          'client:permission__pricing_hook__daily_limit__description2',
        )}](${APP_USE_CHAT_GPT_HOST}/pricing) `,
        `${t(
          'client:permission__pricing_hook__daily_limit__description3',
        )} ${next_reset_timestamp}${t(
          'client:permission__pricing_hook__daily_limit__description4',
        )} `,
        `[${t(
          'client:permission__pricing_hook__daily_limit__description5',
        )}](${APP_USE_CHAT_GPT_HOST}/pricing)`,
        `${t('client:permission__pricing_hook__daily_limit__description6')} `,
        `[${t(
          'client:permission__pricing_hook__daily_limit__description7',
        )}](${APP_USE_CHAT_GPT_HOST}/my-plan)`,
        `${t('client:permission__pricing_hook__daily_limit__description8')}`,
      ]
      return textOfParts.join('')
    },
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // 自定义prompt
  CUSTOM_PROMPT: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/custom-prompt.png`,
    title: (t) => t('client:permission__pricing_hook__custom_prompt__title'),
    description: (t) =>
      t('client:permission__pricing_hook__custom_prompt__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // 自定义prompt
  CUSTOM_PROMPT_GROUP: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/custom-prompt-group.png`,
    title: (t) =>
      t('client:permission__pricing_hook__custom_prompt_group__title'),
    description: (t) =>
      t('client:permission__pricing_hook__custom_prompt_group__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Gmail cta button - 新邮件
  GMAIL_CTA_DRAFT_BUTTON: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/gmail-cta-button.png`,
    title: (t) =>
      t('client:permission__pricing_hook__gmail_cta_button_draft__title'),
    description: (t) =>
      t('client:permission__pricing_hook__gmail_cta_button_draft__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Gmail cta button - 回复邮件
  GMAIL_CTA_REPLY_BUTTON: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/gmail-cta-button.png`,
    title: (t) =>
      t('client:permission__pricing_hook__gmail_cta_button_reply__title'),
    description: (t) =>
      t('client:permission__pricing_hook__gmail_cta_button_reply__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Gmail context menu
  GMAIL_CONTEXT_MENU: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/gmail-context-menu.png`,
    title: (t) =>
      t('client:permission__pricing_hook__gmail_context_menu__title'),
    description: (t) =>
      t('client:permission__pricing_hook__gmail_context_menu__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // AI response language
  AI_RESPONSE_LANGUAGE: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/ai-response-language.png`,
    title: (t) =>
      t('client:permission__pricing_hook__ai_response_language__title'),
    description: (t) =>
      t('client:permission__pricing_hook__ai_response_language__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // ChatGPT Stable mode
  CHATGPT_STABLE_MODE: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/chatgpt-stable-mode.png`,
    title: (t) =>
      t('client:permission__pricing_hook__chatgpt_stable_mode__title'),
    description: (t) =>
      t('client:permission__pricing_hook__chatgpt_stable_mode__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // pdf ai viewer
  PDF_AI_VIEWER: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/pdf.png`,
    title: (t) => t('client:permission__pricing_hook__pdf_ai_viewer__title'),
    description: (t) =>
      t('client:permission__pricing_hook__pdf_ai_viewer__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // Preferred language
  PREFERRED_LANGUAGE: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/preferred-language.png`,
    title: (t) =>
      t('client:permission__pricing_hook__preferred_language__title'),
    description: (t) =>
      t('client:permission__pricing_hook__preferred_language__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - temperature
  MAX_AI_TEMPERATURE: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/max-ai-temperature.png`,
    title: (t) =>
      t('client:permission__pricing_hook__max_ai_temperature__title'),
    description: (t) =>
      t('client:permission__pricing_hook__max_ai_temperature__description'),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
  // MAX AI - paid model - gpt3.5 16k
  MAX_AI_PAID_MODEL_GPT3_5_16K: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/max-ai-paid-model-gpt3-5-16k.png`,
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
  MAX_AI_PAID_MODEL_GPT4: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/max-ai-paid-model-gpt4.png`,
    title: (t) =>
      t('client:permission__pricing_hook__max_ai_paid_model__gpt4__title'),
    description: (t) =>
      t(
        'client:permission__pricing_hook__max_ai_paid_model__gpt4__description',
      ),
    ctaButtonText: (t) =>
      t('client:permission__pricing_hook__button__upgrade_to_pro'),
  },
}
