import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export enum PoeModel {
  ClaudeInstant = 'a2',
  ClaudePlus = 'a2_2',
  ClaudeInstant100k = 'a2_100k',
}
export const POE_MODELS: IAIProviderModel[] = [
  {
    title: 'Claude-instant',
    value: PoeModel.ClaudeInstant,
    maxTokens: 9000,
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(9000, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `Anthropic’s fastest model, with strength in creative tasks. Features a context window of 9k tokens (around 7,000 words).`,
      },
    ],
  },
  {
    title: 'Claude+',
    value: PoeModel.ClaudePlus,
    maxTokens: 9000,
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(9000, 0)} tokens`,
      },
      {
        label: 'Description',
        value:
          "Anthropic's most powerful model. Particularly good at creative writing.",
      },
    ],
  },
  {
    title: 'Claude-instant-100k',
    value: PoeModel.ClaudeInstant100k,
    maxTokens: 100000,
    titleTag: '',
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(100000, 0)} tokens`,
      },
      {
        label: 'Description',
        value: `Anthropic’s fastest model, with an increased context window of 100k tokens (around 75,000 words). Enables analysis of very long documents, code, and more. Since this is an experimental early access model, usage is currently limited to 100 messages per month for Poe subscribers (subject to change).`,
      },
    ],
  },
]
