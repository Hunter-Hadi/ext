import { IAIProviderModel } from '@/features/chatgpt/types'

export const MAXAI_FREE_MODELS: IAIProviderModel[] = [
  {
    title: 'mistral-7b-instruct',
    titleTag: '',
    value: 'mistral-7b-instruct',
    maxTokens: 8192,
    tags: [],
    poweredBy: 'Mistral',
    description: (t) =>
      t(`client:provider__free_ai__model__mistral_7b_instruct__description`),
  },
  {
    title: 'openchat-7b',
    titleTag: '',
    value: 'openchat-7b',
    maxTokens: 8192,
    tags: [],
    poweredBy: 'Openchat',
    description: (t) =>
      t(`client:provider__free_ai__model__openchat_7b__description`),
  },
  {
    title: 'mythomist-7b',
    titleTag: '',
    value: 'mythomist-7b',
    maxTokens: 32768,
    tags: [],
    poweredBy: 'MythoMist',
    description: (t) =>
      t(`client:provider__free_ai__model__mythomist_7b__description`),
  },
]
