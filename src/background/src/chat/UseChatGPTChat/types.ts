// @docs - https://platform.openai.com/docs/models/gpt-4
import { IAIProviderModel } from '@/features/chatgpt/types'
// import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
// import dayjs from 'dayjs'

export const USE_CHAT_GPT_PLUS_MODELS: IAIProviderModel[] = [
  {
    title: 'gpt-3.5-turbo',
    titleTag: '',
    value: 'gpt-3.5-turbo',
    maxTokens: 4096,
    tags: [],
    descriptions: [
      // {
      //   label: (t) => t('client:provider__model__tooltip_card__label__max_token'),
      //   value: `${numberWithCommas(4096, 0)} tokens`,
      // },
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
    title: 'gpt-3.5-turbo-16k',
    titleTag: '',
    value: 'gpt-3.5-turbo-16k',
    maxTokens: 16384,
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t(`client:provider__chatgpt__model__gpt_3_5_16k__description`),
      },
    ],
  },
  {
    title: 'gpt-4',
    titleTag: '',
    value: 'gpt-4',
    maxTokens: 8192,
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) => t(`client:provider__chatgpt__model__gpt_4__description`),
      },
    ],
  },
]
