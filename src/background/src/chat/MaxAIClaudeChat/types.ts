import { IAIProviderModel } from '@/features/chatgpt/types'
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
    poweredBy: 'Anthropic',
    description: (t) =>
      t(`client:provider__claude__model__claude_2_100k__description`),
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V2',
      roles: ['pro', 'elite'],
    },
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
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V2_1',
      roles: ['elite'],
    },
  },
  {
    title: 'claude-3-sonnet',
    titleTag: '',
    value: 'claude-3-sonnet',
    maxTokens: 200000,
    tags: [],
    poweredBy: 'Anthropic',
    description: (t) =>
      t(`client:provider__claude__model__claude_3_200k__description`),
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_CLAUDE_V3',
      roles: ['elite'],
    },
    uploadFileConfig: {
      maxFileSize: 20 * 1024 * 1024, // 20
      accept: '.jpg,.jpeg,.png,.webp,.gif',
      acceptTooltip: (t) =>
        t('client:provider__chatgpt__upload__accept_tooltip'),
      maxCount: 5,
    },
  },
]
