/**
 * @author -  @huangsong
 * @since - 2023-07-18
 */

import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'
// import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export const BARD_MODELS: IAIProviderModel[] = [
  {
    title: 'Gemini',
    titleTag: '',
    value: 'PaLM 2',
    maxTokens: 32768,
    tags: [],
    poweredBy: 'Google',
    description: (t) =>
      t('client:provider__bard_web_app__model__gemini__description'),
    uploadFileConfig: {
      maxFileSize: 25 * 1024 * 1024, // 25MB
      accept: '.jpg,.jpeg,.png,.webp',
      acceptTooltip: (t) =>
        t('client:provider__bard_web_app__upload__accept_tooltip'),
      maxCount: 1,
    },
  },
]
