import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export const MAXAI_FREE_MODELS: IAIProviderModel[] = [
  {
    title: 'mistral-7b-instruct',
    titleTag: '',
    value: 'mistral-7b-instruct',
    maxTokens: 8192,
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
          t(
            `client:provider__free_ai__model__mistral_7b_instruct__description`,
          ),
      },
    ],
  },
  {
    title: 'openchat-7b',
    titleTag: '',
    value: 'openchat-7b',
    maxTokens: 8192,
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
          t(`client:provider__free_ai__model__openchat_7b__description`),
      },
    ],
  },
  {
    title: 'mythomist-7b',
    titleTag: '',
    value: 'mythomist-7b',
    maxTokens: 32768,
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
          t(`client:provider__free_ai__model__mythomist_7b__description`),
      },
    ],
  },
]
