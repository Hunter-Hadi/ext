import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export enum PoeModel {
  ClaudeInstant = 'a2',
  ClaudePlus = 'a2_2',
  ClaudeInstant100k = 'a2_100k',
}
export const POE_MODELS: IAIProviderModel[] = [
  {
    title: 'Claude-instant',
    value: PoeModel.ClaudeInstant,
    maxTokens: 9000,
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(9000, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) => t('client:provider__poe__model__a2__description'),
      },
    ],
  },
  {
    title: 'Claude+',
    value: PoeModel.ClaudePlus,
    maxTokens: 9000,
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(9000, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) => t('client:provider__poe__model__a2_2__description'),
      },
    ],
  },
  {
    title: 'Claude-instant-100k',
    value: PoeModel.ClaudeInstant100k,
    maxTokens: 100000,
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(100000, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) => t('client:provider__poe__model__a2_100k__description'),
      },
    ],
  },
]
