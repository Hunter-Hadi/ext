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
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t('client:provider__bard_web_app__model__palm_2__description'),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__what_it_can_do'),
        value: (t) =>
          t(
            'client:provider__bard_web_app__model__what_it_can_do__description',
          ),
      },
    ],
    uploadFileConfig: {
      maxFileSize: 25 * 1024 * 1024, // 25MB
      accept: '.jpg,.jpeg,.png,.webp',
      acceptTooltip: (t) =>
        t('client:provider__bard_web_app__upload__accept_tooltip'),
      maxCount: 1,
    },
  },
]
