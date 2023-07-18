/**
 * @author -  @huangsong
 * @since - 2023-07-18
 */
import { IAIProviderModel } from '@/features/chatgpt/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export const BARD_MODELS: IAIProviderModel[] = [
  {
    title: 'PaLM 2',
    titleTag: '',
    value: 'PaLM 2',
    maxTokens: 4096,
    tags: [],
    descriptions: [
      {
        label: 'Max tokens',
        value: `${numberWithCommas(4096, 0)} tokens`,
      },
      {
        label: 'Description',
        value:
          'The most advanced model by Google. Powers Bard, PaLM API, MakerSuite, and various Workspace features at Google.',
      },
      {
        label: 'What it can do',
        value: 'Reasoning, multilingual translation, coding, and more.',
      },
    ],
  },
]
