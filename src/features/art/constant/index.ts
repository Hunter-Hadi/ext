import dayjs from 'dayjs'

import { IArtImageGenerateModel } from '@/features/art/types'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

export const MAXAI_IMAGE_GENERATE_MODELS: IArtImageGenerateModel[] = [
  {
    title: 'DALL·E 3',
    titleTag: '',
    value: 'dall-e-3',
    maxTokens: 4096,
    tags: [],
    exampleImage: '',
    descriptions: [
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__max_token'),
        value: (t) =>
          `${numberWithCommas(4096, 0)} ${t(
            'client:provider__model__tooltip_card__label__max_token__suffix',
          )}`,
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__description'),
        value: (t) =>
          t(`client:provider__chatgpt__model__gpt_3_5__description`),
      },
      {
        label: (t) =>
          t('client:provider__model__tooltip_card__label__training_date'),
        value: (t) =>
          `${t(
            'client:provider__model__tooltip_card__label__training_date__prefix',
          )} ${dayjs('2021-09-01').format('MMM YYYY')}`,
      },
    ],
    permission: {
      sceneType: 'MAXAI_PAID_MODEL_GEMINI_PRO',
      roles: ['elite'],
    },
    maxGenerateCount: 1,
    aspectRatios: [
      {
        label: (t) =>
          t('client:art__image_generate__aspect_ratio__square__title'),
        value: '1:1',
        resolution: [1024, 1024],
      },
      {
        label: (t) =>
          t('client:art__image_generate__aspect_ratio__widescreen__title'),
        value: '16:9',
        resolution: [1792, 1024],
      },
      {
        label: (t) =>
          t('client:art__image_generate__aspect_ratio__portrait__title'),
        value: '9:16',
        resolution: [1024, 1792],
      },
    ],
    contentTypes: [
      {
        label: (t) => t('client:art__image_generate__content_type__art__title'),
        value: 'vivid',
        exampleImage: '',
      },
      {
        label: (t) =>
          t('client:art__image_generate__content_type__photo__title'),
        value: 'natural',
        exampleImage: '',
      },
    ],
  },
]
