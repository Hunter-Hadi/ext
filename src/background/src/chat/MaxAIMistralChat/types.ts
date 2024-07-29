import { MAXAI_NORMAL_MODEL_UPLOAD_CONFIG } from '@/background/src/chat/constant'
import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'

export const MAXAI_MISTRAL_MODELS: IAIProviderModel[] = [
  {
    title: 'Mistral-Large-2',
    titleTag: '',
    value: 'mistral-large-2',
    maxTokens: 128 * 1000,
    tags: ['Beta'],
    poweredBy: 'MistralAI',
    description: (t) =>
      t(`client:provider__llama__model__mistral_large_2__description`),
    uploadFileConfig: MAXAI_NORMAL_MODEL_UPLOAD_CONFIG,
  },
]
