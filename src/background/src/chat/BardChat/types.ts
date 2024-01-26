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
    maxTokens: 8192,
    tags: [],
    poweredBy: 'Google',
    description: (t) =>
      t('client:provider__bard_web_app__model__palm_2__description'),
    uploadFileConfig: {
      maxFileSize: 25 * 1024 * 1024, // 25MB
      accept: '.jpg,.jpeg,.png,.webp',
      acceptTooltip: (t) =>
        t('client:provider__bard_web_app__upload__accept_tooltip'),
      maxCount: 1,
    },
  },
]
