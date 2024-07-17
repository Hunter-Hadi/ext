import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'

export interface IOpenAIApiChatMessage {
  role: 'system' | 'assistant' | 'user'
  content: string
}
export type IOpenAIApiSettingsType = {
  apiKey?: string
  apiHost?: string
  apiModel?: string
  temperature?: number
}
const currentDate = new Date().toISOString().split('T')[0]

// export const OPENAI_API_SYSTEM_MESSAGE = `You are ChatGPT, a large language model trained by OpenAI.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`

export const openAIAPISystemPromptGenerator = (model: string) => {
  let cutoffDate = '2021-09-01'
  if (model === 'gpt-4-1106-preview' || model === 'gpt-4-vision-preview') {
    cutoffDate = '2023-04-01'
  }
  return `You are ChatGPT, a large language model trained by OpenAI.\nKnowledge cutoff: ${cutoffDate}\nCurrent date: ${currentDate}`
}

// @docs - https://platform.openai.com/docs/models/gpt-4
export const OPENAI_API_MODELS: IAIProviderModel[] = [
  {
    title: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo',
    titleTag: '',
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_3_5__description'),
    maxTokens: 4096,
  },
  {
    title: 'gpt-3.5-turbo-16k',
    value: 'gpt-3.5-turbo-16k',
    titleTag: '',
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_3_5_16k__description'),
    maxTokens: 16384,
  },
  {
    title: 'gpt-4',
    value: 'gpt-4',
    titleTag: '',
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_4__description'),

    maxTokens: 8192,
  },
  {
    title: 'gpt-4-32k',
    value: 'gpt-4-32k',
    disabled: true,
    titleTag: '',
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_4_32k__description'),
    maxTokens: 32768,
  },
  {
    title: 'gpt-3.5-turbo-1106',
    value: 'gpt-3.5-turbo-1106',
    titleTag: '',
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_3_5_1106__description'),
    maxTokens: 16385,
  },
  {
    title: 'gpt-4-0613',
    value: 'gpt-4-0613',
    titleTag: '',
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_4_0613__description'),
    maxTokens: 8192,
  },
  {
    title: 'gpt-4-32k-0613',
    value: 'gpt-4-32k-0613',
    disabled: true,
    titleTag: '',
    tags: [],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_4_0613_32k__description'),
    maxTokens: 32768,
  },
  {
    title: 'gpt-4-turbo',
    value: 'gpt-4-1106-preview',
    titleTag: 'New',
    tags: ['New'],
    poweredBy: 'OpenAI',
    description: (t) =>
      t('client:provider__openai_api__model__gpt_4_1106_preview__description'),
    maxTokens: 128000,
  },
  {
    title: 'gpt-4-vision-preview',
    value: 'gpt-4-vision-preview',
    disabled: true,
    titleTag: 'New',
    tags: ['New', 'Coming soon'],
    poweredBy: 'OpenAI',
    description: (t) =>
      t(
        'client:provider__openai_api__model__gpt_4_vision_preview__description',
      ),
    maxTokens: 128000,
  },
]
