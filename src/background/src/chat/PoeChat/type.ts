import { IAIProviderModel } from '@/features/chatgpt/types'

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
    description: (t) => t('client:provider__poe__model__a2__description'),
    poweredBy: 'POE',
  },
  {
    title: 'Claude+',
    value: PoeModel.ClaudePlus,
    maxTokens: 9000,
    titleTag: '',
    tags: [],
    description: (t) => t('client:provider__poe__model__a2_2__description'),
    poweredBy: 'POE',
  },
  {
    title: 'Claude-instant-100k',
    value: PoeModel.ClaudeInstant100k,
    maxTokens: 100000,
    titleTag: '',
    tags: [],
    poweredBy: 'POE',
    description: (t) => t('client:provider__poe__model__a2_100k__description'),
  },
]
