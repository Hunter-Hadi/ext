// @docs - https://platform.openai.com/docs/models/gpt-4
import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'
import dayjs from 'dayjs'

export const USE_CHAT_GPT_PLUS_MODELS: IAIProviderModel[] = [
  {
    title: 'gpt-3.5-turbo',
    titleTag: '',
    value: 'gpt-3.5-turbo',
    maxTokens: 4096,
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(4096, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `OpenAI's most capable GPT-3.5 model and fastest model, great for everyday tasks.  Will be updated with OpenAI's latest model iteration 2 weeks after it is released.`,
      },
      {
        label: 'Training date',
        value: `Up to ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
  },
]
