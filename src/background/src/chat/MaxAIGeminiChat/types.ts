import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export type IMaxAIGeminiMessageType = {
  type: 'human' | 'ai' | 'generic' | 'system' | 'function'
  data: {
    content: string
    additional_kwargs: {
      [key: string]: any
    }
  }
}

export const MAXAI_GENMINI_MODELS: IAIProviderModel[] = [
  {
    title: 'gemini-pro',
    titleTag: '',
    value: 'gemini-pro',
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
          t(`client:provider__gemini__model__gemini_pro__description`),
      },
    ],
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GEMINI_PRO',
      roles: ['elite'],
    },
  },
]
