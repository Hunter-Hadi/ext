import { MAXAI_VISION_MODEL_UPLOAD_CONFIG } from '@/background/src/chat/constant'
import { IAIProviderModel } from '@/features/chatgpt/types'

export const MAXAI_GENMINI_MODELS: IAIProviderModel[] = [
  {
    title: 'gemini-pro',
    titleTag: '',
    value: 'gemini-pro',
    maxTokens: 32768,
    tags: ['Beta', 'Vision'],
    poweredBy: 'Google',
    description: (t) =>
      t(`client:provider__gemini__model__gemini_pro__description`),
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GEMINI_PRO',
      roles: ['elite'],
    },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'gemini-1.5-pro',
    titleTag: '',
    value: 'gemini-1.5-pro',
    maxTokens: 1000 * 1000,
    tags: ['Beta', 'Vision'],
    poweredBy: 'Google',
    description: (t) =>
      t(`client:provider__gemini__model__gemini_pro_1_5__description`),
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GEMINI_1_5_PRO',
      roles: ['elite'],
    },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
]
