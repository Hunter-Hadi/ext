import { IAIProviderModel } from '@/features/chatgpt/types'

export const MAXAI_GENMINI_MODELS: IAIProviderModel[] = [
  {
    title: 'gemini-pro',
    titleTag: '',
    value: 'gemini-pro',
    maxTokens: 32768,
    tags: [],
    poweredBy: 'Google',
    description: (t) =>
      t(`client:provider__gemini__model__gemini_pro__description`),
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GEMINI_PRO',
      roles: ['elite'],
    },
  },
]
