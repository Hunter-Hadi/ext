import { MAXAI_NORMAL_MODEL_UPLOAD_CONFIG } from '@/background/src/chat/constant'
import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'

export const MAXAI_LLAMA_MODELS: IAIProviderModel[] = [
  {
    title: 'Llama-3.1-405B',
    titleTag: '',
    value: 'llama-3.1-405b',
    maxTokens: 128 * 1000,
    tags: ['Beta'],
    poweredBy: 'Meta',
    description: (t) =>
      t(`client:provider__llama__model__llama_3_1_405b__description`),
    uploadFileConfig: MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  },
  {
    title: 'Llama-3.1-70B',
    titleTag: '',
    value: 'llama-3.1-70b',
    maxTokens: 128 * 1000,
    tags: ['Beta'],
    poweredBy: 'Meta',
    description: (t) =>
      t(`client:provider__llama__model__llama_3_1_470b__description`),
    uploadFileConfig: MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  },
]
