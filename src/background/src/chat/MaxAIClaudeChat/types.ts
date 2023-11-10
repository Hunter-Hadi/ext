import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export type IMaxAIClaudeMessageType = {
  type: 'human' | 'ai' | 'generic' | 'system' | 'function'
  data: {
    content: string
    additional_kwargs: {
      [key: string]: any
    }
  }
}

export const MAXAI_CLAUDE_MODELS: IAIProviderModel[] = [
  {
    title: 'claude-instant-100k',
    titleTag: '',
    value: 'claude-instant-v1',
    maxTokens: 100000,
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
        value: (t) =>
          t(`client:provider__claude__model__claude_instant_100k__description`),
      },
    ],
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_CLAUDE_INSTANT_V1',
      roles: ['pro', 'elite'],
    },
  },
  {
    title: 'claude-2-100k',
    titleTag: '',
    value: 'claude-2',
    maxTokens: 100000,
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
        value: (t) =>
          t(`client:provider__claude__model__claude_2_100k__description`),
      },
    ],
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V2',
      roles: ['pro', 'elite'],
    },
  },
]
