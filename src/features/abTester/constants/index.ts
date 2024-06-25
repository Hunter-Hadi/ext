import {
  IPaywallVariant,
  IUpdateVariant,
  IUpdateVariantConfig,
} from '@/features/abTester/types'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

export const UPDATE_VARIANT: IUpdateVariant[] = [
  'gpt-4o',
  'claude-3-opus',
  'claude-3.5-sonnet',
  'gemini-1.5-pro',
  'art',
  'summary',
  'instant-reply',
  'search',
  'rewriter',
  'prompts',
  'translator',
  'vision',
]

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
  'claude-3.5-sonnet': {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-claude-3.5-sonnet.png',
    ),
    title: (t) =>
      t('client:sidebar__promotion_dialog__claude_3_5__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__claude_3_5__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__claude_3_5__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__claude_3_5__content_item3__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__claude_3_5__content_item4__description',
        ),
      },
    ],
    learnMoreLink: 'https://www.maxai.me/docs/release-notes/claude-3-5-sonnet',
  },
  'gemini-1.5-pro': {
    image: getChromeExtensionAssetsURL(
      '/images/activity/promotion-dialog-gemini-1.5-pro.png',
    ),
    title: (t) =>
      t('client:sidebar__promotion_dialog__gemini_1_5_pro__content__title'),
    descriptions: (t) => [
      {
        description: t(
          'client:sidebar__promotion_dialog__gemini_1_5_pro__content_item1__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__gemini_1_5_pro__content_item2__description',
        ),
      },
      {
        description: t(
          'client:sidebar__promotion_dialog__gemini_1_5_pro__content_item3__description',
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

/**
 * paywall A/B test值
 */
export const PAYWALL_VARIANT: IPaywallVariant[] = ['3-1', '3-2']

/**
 * 显示paywall modal对应的variant
 */
export const PAYWALL_MODAL_VARIANT = '3-2'

/**
 * A/B Test专用的存储
 * 比如某些场景下要记录用户id来进行A/B Test的判断
 */
export const CHROME_EXTENSION_USER_ABTEST_SAVE_KEY =
  'CHROME_EXTENSION_USER_ABTEST_SAVE_KEY'
