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
    ],
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GPT4',
      roles: ['pro'],
    },
  },
  {
    title: 'claude-2-100k',
    titleTag: '',
    value: 'claude-2',
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
    ],
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GPT4',
      roles: ['pro'],
    },
  },
]
