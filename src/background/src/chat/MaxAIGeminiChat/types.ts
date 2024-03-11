import { IAIProviderModel } from '@/features/chatgpt/types'

export const MAXAI_GENMINI_MODELS: IAIProviderModel[] = [
  {
    title: 'gemini-pro',
    titleTag: '',
    value: 'gemini-pro',
    maxTokens: 32768,
    tags: ['Beta'],
    poweredBy: 'Google',
    description: (t) =>
      t(`client:provider__gemini__model__gemini_pro__description`),
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GEMINI_PRO',
      roles: ['elite'],
    },
    uploadFileConfig: {
      maxFileSize: 20 * 1024 * 1024, // 20
      accept: '.jpg,.jpeg,.png,.webp',
      acceptTooltip: (t) =>
        t('client:provider__gemini__upload__accept_tooltip'),
      maxCount: 1,
    },
  },
]
