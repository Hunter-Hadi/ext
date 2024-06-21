import {
  MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  MAXAI_VISION_MODEL_UPLOAD_CONFIG,
} from '@/background/src/chat/constant'
import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export const MAXAI_CLAUDE_MODELS: IAIProviderModel[] = [
  {
    title: 'claude-instant-100k',
    titleTag: '',
    value: 'claude-instant-v1',
    maxTokens: 100000,
    tags: [],
    poweredBy: 'Anthropic',
    description: (t) =>
      `${numberWithCommas(100000, 0)} ${t(
        'client:provider__model__tooltip_card__label__max_token__suffix',
      )}`,
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_CLAUDE_INSTANT_V1',
    //   roles: ['pro', 'elite'],
    // },
    uploadFileConfig: MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'claude-2-100k',
    titleTag: '',
    value: 'claude-2',
    maxTokens: 100000,
    tags: [],
    poweredBy: 'Anthropic',
    description: (t) =>
      t(`client:provider__claude__model__claude_2_100k__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V2',
    //   roles: ['pro', 'elite'],
    // },
    uploadFileConfig: MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'claude-2.1-200k',
    titleTag: '',
    value: 'claude-v2:1',
    maxTokens: 200000,
    tags: [],
    poweredBy: 'Anthropic',
    description: (t) =>
      t(`client:provider__claude__model__claude_2_1_200k__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V2_1',
    //   roles: ['elite'],
    // },
    uploadFileConfig: MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'claude-3-haiku',
    titleTag: '',
    value: 'claude-3-haiku',
    maxTokens: 200000,
    tags: (currentConversationType) => {
      const tags = []
      if (currentConversationType !== 'Search') {
        tags.push('Vision')
      }
      return tags
    },
    poweredBy: 'Anthropic',
    description: (t) =>
      t(`client:provider__claude__model__claude_3_haiku__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V3_HAIKU',
    //   roles: ['elite'],
    // },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'claude-3-sonnet',
    titleTag: '',
    value: 'claude-3-sonnet',
    maxTokens: 200000,
    tags: (currentConversationType) => {
      const tags = []
      if (currentConversationType !== 'Search') {
        tags.push('Vision')
      }
      return tags
    },
    poweredBy: 'Anthropic',
    description: (t) =>
      t(`client:provider__claude__model__claude_3_sonnet__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V3_SONNET',
    //   roles: ['elite'],
    // },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'claude-3-opus',
    titleTag: '',
    value: 'claude-3-opus',
    maxTokens: 200000,
    tags: (currentConversationType) => {
      const tags = ['Beta']
      if (currentConversationType !== 'Search') {
        tags.push('Vision')
      }
      return tags
    },
    poweredBy: 'Anthropic',
    description: (t) =>
      t(`client:provider__claude__model__claude_3_opus__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V3_OPUS',
    //   roles: ['elite'],
    // },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'claude-3.5-sonnet',
    titleTag: '',
    value: 'claude-3-5-sonnet',
    maxTokens: 200000,
    tags: (currentConversationType) => {
      const tags = ['Beta']
      if (currentConversationType !== 'Search') {
        tags.push('Vision')
      }
      return tags
    },
    poweredBy: 'Anthropic',
    description: (t) =>
      t(`client:provider__claude__model__claude_3_5_opus__description`),
    // permission: {
    //   sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V3_OPUS',
    //   roles: ['elite'],
    // },
    uploadFileConfig: MAXAI_VISION_MODEL_UPLOAD_CONFIG,
  },
]
