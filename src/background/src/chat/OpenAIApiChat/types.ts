import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import dayjs from 'dayjs'

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

export const CHATGPT_SYSTEM_MESSAGE = `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`

// @docs - https://platform.openai.com/docs/models/gpt-4
export const OPENAI_API_MODELS: IAIProviderModel[] = [
  {
    title: 'gpt-3.5-turbo',
    value: 'gpt-3.5-turbo',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(4096, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `OpenAI's most capable GPT-3.5 model and optimized for chat at 1/10th the cost of text-davinci-003.  Will be updated with OpenAI's latest model iteration 2 weeks after it is released.`,
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 4096,
  },
  {
    title: 'gpt-3.5-turbo-16k',
    value: 'gpt-3.5-turbo-16k',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(16384, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `Same capabilities as the standard gpt-3.5-turbo model but with 4 times the context.\t`,
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 16384,
  },
  {
    title: 'gpt-4',
    value: 'gpt-4',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(8192, 0)} tokens`,
      },
      {
        label: 'Description',
        value:
          "More capable than any GPT-3.5 model, able to do more complex tasks, and optimized for chat. Will be updated with OpenAI's latest model iteration 2 weeks after it is released.",
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 8192,
  },
  {
    title: 'gpt-4-32k',
    value: 'gpt-4-32k',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(32768, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `Same capabilities as the base gpt-4 mode but with 4x the context length. Will be updated with our latest model iteration.`,
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 32768,
  },
  {
    title: 'gpt-3.5-turbo-0613',
    value: 'gpt-3.5-turbo-0613',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(4096, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `Snapshot of gpt-3.5-turbo from June 13th 2023 with function calling data. Unlike gpt-3.5-turbo, this model will not receive updates, and will be deprecated 3 months after a new version is released.\t`,
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 4096,
  },
  {
    title: 'gpt-3.5-turbo-16k-0613',
    value: 'gpt-3.5-turbo-16k-0613',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(16384, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `Snapshot of gpt-3.5-turbo-16k from June 13th 2023. Unlike gpt-3.5-turbo-16k, this model will not receive updates, and will be deprecated 3 months after a new version is released.\t`,
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 16384,
  },
  {
    title: 'gpt-4-0613',
    value: 'gpt-4-0613',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(8192, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `Snapshot of gpt-4 from June 13th 2023 with function calling data. Unlike gpt-4, this model will not receive updates, and will be deprecated 3 months after a new version is released.`,
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 8192,
  },
  {
    title: 'gpt-4-32k-0613',
    value: 'gpt-4-32k-0613',
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(32768, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `Snapshot of gpt-4-32 from June 13th 2023. Unlike gpt-4-32k, this model will not receive updates, and will be deprecated 3 months after a new version is released.\t`,
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    maxTokens: 32768,
  },
]
