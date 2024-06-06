import { TFunction } from 'i18next'

import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

export type IUpdateVariant = (typeof UPDATE_VARIANT)[number]

export type IUpdateVariantConfig = {
  image: string
  title: (t: TFunction<['client']>) => string
  descriptions: (
    t: TFunction<['client']>,
  ) => { title?: string; description: string }[]
}

export const UPDATE_VARIANT = [
  'gpt-4o',
  'claude-3-opus',
  'gemini-1.5-pro',
  'art',
  'summary',
  'instant-reply',
  'search',
  'rewriter',
  'prompts',
  'translator',
  'vision',
] as const

export const UPDATE_VARIANT_TEMPLATES: Record<
  IUpdateVariant,
  IUpdateVariantConfig
> = {
  'gpt-4o': {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-gpt-4o.png',
    ),
    title: (t) => t('client:sidebar__promotion_dialog__gpt_4o__content__title'),
    descriptions: (t) => [
      {
        title: t(
          'client:sidebar__promotion_dialog__gpt_4o__content_item1__title',
        ),
        description: t(
          'client:sidebar__promotion_dialog__gpt_4o__content_item1__description',
        ),
      },
      {
        title: t(
          'client:sidebar__promotion_dialog__gpt_4o__content_item2__title',
        ),
        description: t(
          'client:sidebar__promotion_dialog__gpt_4o__content_item2__description',
        ),
      },
      {
        title: t(
          'client:sidebar__promotion_dialog__gpt_4o__content_item3__title',
        ),
        description: t(
          'client:sidebar__promotion_dialog__gpt_4o__content_item3__description',
        ),
      },
    ],
  },
  'claude-3-opus': {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-claude-3.png',
    ),
    title: (t) =>
      t('client:sidebar__promotion_dialog__claude_3__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__claude_3__content_item1__description',
        ),
      },
      {
        title: t(
          'client:sidebar__promotion_dialog__claude_3__content_item2__title',
        ),
        description: t(
          'client:sidebar__promotion_dialog__claude_3__content_item2__description',
        ),
      },
      {
        title: t(
          'client:sidebar__promotion_dialog__claude_3__content_item3__title',
        ),
        description: t(
          'client:sidebar__promotion_dialog__claude_3__content_item3__description',
        ),
      },
      {
        title: t(
          'client:sidebar__promotion_dialog__claude_3__content_item4__title',
        ),
        description: t(
          'client:sidebar__promotion_dialog__claude_3__content_item4__description',
        ),
      },
    ],
  },
  'gemini-1.5-pro': {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-gemini-1.5-pro.png',
    ),
    title: (t) =>
      t('client:sidebar__promotion_dialog__gemini_1.5_pro__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__gemini_1.5_pro__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__gemini_1.5_pro__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__gemini_1.5_pro__content_item3__description',
        ),
      },
    ],
  },
  art: {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-art.png',
    ),
    title: (t) => t('client:sidebar__promotion_dialog__art__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__art__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__art__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__art__content_item3__description',
        ),
      },
    ],
  },
  summary: {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-summary.png',
    ),
    title: (t) =>
      t('client:sidebar__promotion_dialog__summary__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__summary__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__summary__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__summary__content_item3__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__summary__content_item4__description',
        ),
      },
    ],
  },
  'instant-reply': {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-instant-reply.png',
    ),
    title: (t) =>
      t('client:sidebar__promotion_dialog__instant_reply__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__instant_reply__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__instant_reply__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__instant_reply__content_item3__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__instant_reply__content_item4__description',
        ),
      },
    ],
  },
  search: {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-search.png',
    ),
    title: (t) => t('client:sidebar__promotion_dialog__search__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__search__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__search__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__search__content_item3__description',
        ),
      },
    ],
  },
  rewriter: {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-rewriter.png',
    ),
    title: (t) =>
      t('client:sidebar__promotion_dialog__rewriter__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__rewriter__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__rewriter__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__rewriter__content_item3__description',
        ),
      },
    ],
  },
  prompts: {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-prompts.png',
    ),
    title: (t) =>
      t('client:sidebar__promotion_dialog__prompts__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__prompts__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__prompts__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__prompts__content_item3__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__prompts__content_item4__description',
        ),
      },
    ],
  },
  translator: {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-translator.png',
    ),
    title: (t) =>
      t('client:sidebar__promotion_dialog__translator__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__translator__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__translator__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__translator__content_item3__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__translator__content_item4__description',
        ),
      },
    ],
  },
  vision: {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-vision.png',
    ),
    title: (t) => t('client:sidebar__promotion_dialog__vision__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__vision__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__vision__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__vision__content_item3__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__vision__content_item4__description',
        ),
      },
    ],
  },
}
