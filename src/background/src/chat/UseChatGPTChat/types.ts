// @docs - https://platform.openai.com/docs/models/gpt-4
import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import dayjs from 'dayjs'
// import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
// import dayjs from 'dayjs'

export type IMaxAIChatGPTMessageType = {
  type: 'human' | 'ai' | 'generic' | 'system' | 'function'
  data: {
    content: string
    additional_kwargs: {
      [key: string]: any
    }
  }
}

export const USE_CHAT_GPT_PLUS_MODELS: IAIProviderModel[] = [
  {
    title: 'gpt-3.5-turbo',
    titleTag: '',
    value: 'gpt-3.5-turbo',
    maxTokens: 4096,
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(4096, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t(`client:provider__chatgpt__model__gpt_3_5__description`),
      },
      // {
      //   label: (t) => t('client:provider__model__tooltip_card__label__training_date'),
      //   value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      // },
    ],
  },
  {
    title: 'gpt-4-turbo',
    titleTag: '',
    value: 'gpt-4-1106-preview',
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(128000, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t(
            'client:provider__openai_api__model__gpt_4_1106_preview__description',
          ),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2023-04-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 128000,
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GPT4',
      roles: ['pro', 'elite'],
    },
  },
  {
    title: 'gpt-3.5-turbo-16k',
    titleTag: '',
    value: 'gpt-3.5-turbo-16k',
    maxTokens: 16384,
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(16384, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t(`client:provider__chatgpt__model__gpt_3_5_16k__description`),
      },
    ],
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GPT3_5_16K',
      roles: ['pro', 'elite'],
    },
  },
]
