import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import dayjs from 'dayjs'

export interface IOpenAIApiChatMessage {
  role: 'system' | 'assistant' | 'user'
  content: string
}
export type IOpenAIApiSettingsType = {
  apiKey?: string
  apiHost?: string
  apiModel?: string
  temperature?: number
}
const currentDate = new Date().toISOString().split('T')[0]

export const OPENAI_API_SYSTEM_MESSAGE = `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`

// @docs - https://platform.openai.com/docs/models/gpt-4
export const OPENAI_API_MODELS: IAIProviderModel[] = [
  {
    title: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo',
    titleTag: '',
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
          t('client:provider__openai_api__model__gpt_3_5__description'),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 4096,
  },
  {
    title: 'gpt-3.5-turbo-16k',
    value: 'gpt-3.5-turbo-16k',
    titleTag: '',
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
          t('client:provider__openai_api__model__gpt_3_5_16k__description'),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 16384,
  },
  {
    title: 'gpt-4',
    value: 'gpt-4',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(8192, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t('client:provider__openai_api__model__gpt_4__description'),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 8192,
  },
  {
    title: 'gpt-4-32k',
    value: 'gpt-4-32k',
    disabled: true,
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(32768, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t('client:provider__openai_api__model__gpt_4_32k__description'),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 32768,
  },
  {
    title: 'gpt-3.5-turbo-1106',
    value: 'gpt-3.5-turbo-1106',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(16385, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t('client:provider__openai_api__model__gpt_3_5_1106__description'),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 16385,
  },
  {
    title: 'gpt-4-0613',
    value: 'gpt-4-0613',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(8192, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t('client:provider__openai_api__model__gpt_4_0613__description'),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 8192,
  },
  {
    title: 'gpt-4-32k-0613',
    value: 'gpt-4-32k-0613',
    disabled: true,
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(32768, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t('client:provider__openai_api__model__gpt_4_0613_32k__description'),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 32768,
  },
  {
    title: 'gpt-4-1106-preview',
    value: 'gpt-4-1106-preview',
    titleTag: 'New',
    tags: ['New'],
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
  },
  {
    title: 'gpt-4-vision-preview',
    value: 'gpt-4-vision-preview',
    disabled: true,
    titleTag: 'New',
    tags: ['New', 'Coming soon'],
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
            'client:provider__openai_api__model__gpt_4_vision_preview__description',
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
  },
]
