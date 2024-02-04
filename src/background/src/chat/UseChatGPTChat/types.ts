// @docs - https://platform.openai.com/docs/models/gpt-4

import { IAIProviderModel } from '@/features/chatgpt/types'
// import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
// import dayjs from 'dayjs'

export type IMaxAIChatGPTBackendAPIType =
  | 'chat_with_document'
  | 'get_chatgpt_response'
  | 'get_summarize_response'

export type IMaxAIChatMessageContentType = 'text' | 'image_url'

export interface IMaxAIChatMessageContent {
  type: IMaxAIChatMessageContentType
  text?: string
  image_url?: {
    url: string
  }
}

/**
 * @description 发送给后端的消息格式
 *
 * @version 2.0 - 2023-12-25
 * @description 2.0 版本的消息格式，将会支持多种类型的消息，例如：图片、视频、音频等
 */

export interface IMaxAIChatMessage {
  role: 'human' | 'ai' | 'generic' | 'system' | 'function'
  content: IMaxAIChatMessageContent[]
}

export const USE_CHAT_GPT_PLUS_MODELS: IAIProviderModel[] = [
  {
    title: 'gpt-3.5-turbo',
    titleTag: '',
    value: 'gpt-3.5-turbo',
    maxTokens: 4096,
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t(`client:provider__chatgpt__model__gpt_3_5__description`),
  },
  // {
  //   title: 'gpt-4-turbo',
  //   titleTag: '',
  //   value: 'gpt-4-1106-preview',
  //   tags: [],
  //   poweredBy: 'OpenAI',
  //   description: (t) =>
  //     t('client:provider__openai_api__model__gpt_4_1106_preview__description'),
  //   maxTokens: 128000,
  //   permission: {
  //     sceneType: 'MAXAI_PAID_MODEL_GPT4_TURBO',
  //     roles: ['pro', 'elite'],
  //   },
  // },
  {
    title: 'gpt-3.5-turbo-16k',
    titleTag: '',
    value: 'gpt-3.5-turbo-16k',
    maxTokens: 16384,
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t(`client:provider__chatgpt__model__gpt_3_5_16k__description`),
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GPT3_5_16K',
      roles: ['pro', 'elite'],
    },
  },
  {
    title: 'gpt-4',
    titleTag: '',
    value: 'gpt-4',
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_4__description'),
    maxTokens: 8192,
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GPT4',
      roles: ['pro', 'elite'],
    },
  },
  {
    title: 'gpt-4-turbo',
    value: 'gpt-4-0125-preview',
    titleTag: 'Vision',
    tags: ['Vision'],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__chatgpt__model__gpt_4_vision__description'),
    maxTokens: 128000,
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GPT4_VISION',
      roles: ['pro', 'elite'],
    },
    uploadFileConfig: {
      maxFileSize: 20 * 1024 * 1024, // 20
      accept: '.jpg,.jpeg,.png,.webp,.gif',
      acceptTooltip: (t) =>
        t('client:provider__chatgpt__upload__accept_tooltip'),
      maxCount: 5,
    },
  },
  // {
  //   title: 'gpt-4-32k',
  //   titleTag: '',
  //   value: 'gpt-4-32k',
  //   tags: [],
  //   descriptions: [
  //     {
  //       label: (t) =>
  //         t('client:provider__model__tooltip_card__label__max_token'),
  //       value: (t) =>
  //         `${numberWithCommas(32768, 0)} ${t(
  //           'client:provider__model__tooltip_card__label__max_token__suffix',
  //         )}`,
  //     },
  //     {
  //       label: (t) =>
  //         t('client:provider__model__tooltip_card__label__description'),
  //       value: (t) =>
  //         t('client:provider__openai_api__model__gpt_4_32k__description'),
  //     },
  //     {
  //       label: (t) =>
  //         t('client:provider__model__tooltip_card__label__training_date'),
  //       value: (t) =>
  //         `${t(
  //           'client:provider__model__tooltip_card__label__training_date__prefix',
  //         )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
  //     },
  //   ],
  //   maxTokens: 32768,
  //   permission: {
  //     sceneType: 'MAXAI_PAID_MODEL_GPT4',
  //     roles: ['pro', 'elite'],
  //   },
  // },
]
