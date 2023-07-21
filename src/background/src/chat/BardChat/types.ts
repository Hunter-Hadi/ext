/**
 * @author -  @huangsong
 * @since - 2023-07-18
 */
import { IAIProviderModel } from '@/features/chatgpt/types'
// import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export const BARD_MODELS: IAIProviderModel[] = [
  {
    title: 'PaLM 2',
    titleTag: '',
    value: 'PaLM 2',
    // 因为Google并没有官方说明
    maxTokens: -1,
    tags: [],
    descriptions: [
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
    uploadFileConfig: {
      maxFileSize: 25 * 1024 * 1024, // 25MB
      accept: '.jpg,.jpeg,.png,.webp',
      acceptTooltip: 'Upload file JEPEG, PNG, WEBP',
      maxCount: 1,
    },
  },
]
