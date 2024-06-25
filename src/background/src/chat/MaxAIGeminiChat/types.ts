import { MAXAI_VISION_MODEL_UPLOAD_CONFIG } from '@/background/src/chat/constant'
import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'

export const MAXAI_GENMINI_MODELS: IAIProviderModel[] = [
  {
    title: 'Gemini-1.5-Flash',
    titleTag: '',
    value: 'gemini-flash-1.5',
    maxTokens: 100 * 1000,
    tags: (currentConversationType) => {
      const tags = ['Beta']
      if (currentConversationType !== 'Search') {
        tags.push('Vision')
      }
      return tags
    },
    poweredBy: 'Google',
    description: (t) =>
      t(`client:provider__gemini__model__gemini_1_5_flash__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_GEMINI_PRO',
    //   roles: ['elite'],
    // },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'Gemini-Pro',
    titleTag: '',
    value: 'gemini-pro',
    maxTokens: 32768,
    tags: (currentConversationType) => {
      const tags = ['Beta']
      if (currentConversationType !== 'Search') {
        tags.push('Vision')
      }
      return tags
    },
    poweredBy: 'Google',
    description: (t) =>
      t(`client:provider__gemini__model__gemini_pro__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_GEMINI_PRO',
    //   roles: ['elite'],
    // },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'Gemini-1.5-Pro',
    titleTag: '',
    value: 'gemini-1.5-pro',
    maxTokens: 1000 * 1000,
    tags: (currentConversationType) => {
      const tags = []
      if (currentConversationType !== 'Search') {
        tags.push('Vision')
      }
      return tags
    },
    poweredBy: 'Google',
    description: (t) =>
      t(`client:provider__gemini__model__gemini_1_5_pro__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_GEMINI_1_5_PRO',
    //   roles: ['elite'],
    // },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
]
