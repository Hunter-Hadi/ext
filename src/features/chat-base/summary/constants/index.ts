import {
  SUMMARY__SHOW_TRANSCRIPT__PROMPT_ID,
  SUMMARY__SUMMARIZE_COMMENTS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__ACTION_ITEMS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID,
  SUMMARY__SUMMARIZE_EMAIL__TL_DR__PROMPT_ID,
  SUMMARY__SUMMARIZE_PAGE__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
  SUMMARY__SUMMARIZE_PAGE__TL_DR__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__PROMPT_ID,
  SUMMARY__SUMMARIZE_PDF__TL_DR__PROMPT_ID,
  SUMMARY__SUMMARIZE_VIDEO__KEY_TAKEAWAYS__PROMPT_ID,
  SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID,
  SUMMARY__TIMESTAMPED_SUMMARY__PROMPT_ID,
} from '@/constants'
import { EMAIL_SUMMARY_ACTIONS_MAP } from '@/features/chat-base/summary/constants/emailSummaryActions'
import { PAGE_SUMMARY_ACTIONS_MAP } from '@/features/chat-base/summary/constants/pageSummaryActions'
import { PDF_SUMMARY_ACTIONS_MAP } from '@/features/chat-base/summary/constants/pdfSummaryActions'
import { YOUTUBE_SUMMARY_ACTIONS_MAP } from '@/features/chat-base/summary/constants/youtubeSummaryActions'
import {
  IPageSummaryNavItem,
  IPageSummaryNavType,
  IPageSummaryType,
} from '@/features/chat-base/summary/types'
import { ISetActionsType } from '@/features/shortcuts/types/Action'

/**
 * summary actions配置，这里是默认的配置，给用户自定义prompt执行
 */
export const DEFAULT_SUMMARY_ACTIONS_MAP: Record<
  IPageSummaryType,
  (messageId?: string) => ISetActionsType
> = {
  PAGE_SUMMARY: PAGE_SUMMARY_ACTIONS_MAP.all,
  DEFAULT_EMAIL_SUMMARY: EMAIL_SUMMARY_ACTIONS_MAP.all,
  PDF_CRX_SUMMARY: PDF_SUMMARY_ACTIONS_MAP.all,
  YOUTUBE_VIDEO_SUMMARY: YOUTUBE_SUMMARY_ACTIONS_MAP.all,
}

/**
 * summary nav list配置
 */
export const PAGE_SUMMARY_NAV_LIST_MAP: Record<
  IPageSummaryType,
  IPageSummaryNavItem[]
> = {
  PAGE_SUMMARY: [
    {
      title: 'Summarize page',
      icon: 'Summarize',
      key: 'all',
      tooltip: 'client:sidebar__summary__nav__page_summary__tooltip__default',
      actions: PAGE_SUMMARY_ACTIONS_MAP.all,
    },
    {
      title: 'Summarize page (TL;DR)',
      icon: 'AutoStoriesOutlined',
      key: 'summary',
      tooltip: 'client:sidebar__summary__nav__page_summary__tooltip__tldr',
      actions: PAGE_SUMMARY_ACTIONS_MAP.summary,
    },
    {
      title: 'Summarize page (Key takeaways)',
      icon: 'Bulleted',
      key: 'keyTakeaways',
      tooltip:
        'client:sidebar__summary__nav__page_summary__tooltip__key_takeaways',
      actions: PAGE_SUMMARY_ACTIONS_MAP.keyTakeaways,
    },
  ],
  PDF_CRX_SUMMARY: [
    {
      title: 'Summarize PDF',
      icon: 'Summarize',
      key: 'all',
      tooltip:
        'client:sidebar__summary__nav__pdf_crx_summary__tooltip__default',
      actions: PDF_SUMMARY_ACTIONS_MAP.all,
    },
    {
      title: 'Summarize PDF (TL;DR)',
      icon: 'AutoStoriesOutlined',
      key: 'summary',
      tooltip: 'client:sidebar__summary__nav__pdf_crx_summary__tooltip__tldr',
      actions: PDF_SUMMARY_ACTIONS_MAP.summary,
    },
    {
      title: 'Summarize PDF (Key takeaways)',
      icon: 'Bulleted',
      key: 'keyTakeaways',
      tooltip:
        'client:sidebar__summary__nav__pdf_crx_summary__tooltip__key_takeaways',
      actions: PDF_SUMMARY_ACTIONS_MAP.keyTakeaways,
    },
  ],
  YOUTUBE_VIDEO_SUMMARY: [
    {
      title: 'Summarize video',
      icon: 'Summarize',
      key: 'all',
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__default',
      actions: YOUTUBE_SUMMARY_ACTIONS_MAP.all,
    },
    {
      title: 'Timestamped summary',
      icon: 'Bulleted',
      key: 'timestamped',
      config: {
        isAutoScroll: false,
      },
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__timestamped',
      actions: YOUTUBE_SUMMARY_ACTIONS_MAP.timestamped,
    },
    {
      title: 'Summarize comments',
      icon: 'CommentOutlined',
      key: 'comment',
      config: {
        isAutoScroll: false,
      },
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__comment',
      actions: YOUTUBE_SUMMARY_ACTIONS_MAP.comment,
    },
    {
      title: 'Show transcript',
      icon: 'ClosedCaptionOffOutlined',
      key: 'transcript',
      config: {
        isAutoScroll: false,
      },
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__transcript',
      actions: YOUTUBE_SUMMARY_ACTIONS_MAP.transcript,
    },
    {
      title: 'Summarize key points',
      icon: 'LongText',
      key: 'keyTakeaways',
      config: {
        isAutoScroll: false,
      },
      tooltip:
        'client:sidebar__summary__nav__youtube_summary__tooltip__key_takeaways',
      actions: YOUTUBE_SUMMARY_ACTIONS_MAP.keyTakeaways,
    },
  ],
  DEFAULT_EMAIL_SUMMARY: [
    {
      title: 'Summarize email',
      icon: 'Summarize',
      key: 'all',
      tooltip: 'client:sidebar__summary__nav__email_summary__tooltip__default',
      actions: EMAIL_SUMMARY_ACTIONS_MAP.all,
    },
    {
      title: 'Summarize email (TL;DR)',
      icon: 'AutoStoriesOutlined',
      key: 'summary',
      tooltip: 'client:sidebar__summary__nav__email_summary__tooltip__tldr',
      actions: EMAIL_SUMMARY_ACTIONS_MAP.summary,
    },
    {
      title: 'Summarize email (Key takeaways)',
      icon: 'Bulleted',
      key: 'keyTakeaways',
      tooltip:
        'client:sidebar__summary__nav__email_summary__tooltip__key_takeaways',
      actions: EMAIL_SUMMARY_ACTIONS_MAP.keyTakeaways,
    },
    {
      title: 'Summarize email (Action items)',
      icon: 'SubjectOutlined',
      key: 'actions',
      tooltip:
        'client:sidebar__summary__nav__email_summary__tooltip__action_items',
      actions: EMAIL_SUMMARY_ACTIONS_MAP.actions,
    },
  ],
}

/**
 * summary nav actions配置，这里配置的是各个nav下触发的prompt_id
 * TODO 可以配置在PAGE_SUMMARY_NAV_LIST里，summary prompt后移后每个nav都对应一个prompt
 */
export const PAGE_SUMMARY_NAV_CONTEXT_MENU_MAP: Record<
  IPageSummaryType,
  Partial<Record<IPageSummaryNavType, { id: string; text: string }>>
  // Partial<Record<IPageSummaryNavType, IContextMenuItem>>
> = {
  PAGE_SUMMARY: {
    all: {
      id: SUMMARY__SUMMARIZE_PAGE__PROMPT_ID,
      text: `[Summary] Summarize page`,
    },
    summary: {
      id: SUMMARY__SUMMARIZE_PAGE__TL_DR__PROMPT_ID,
      text: `[Summary] Summarize page (TL:DR)`,
    },
    keyTakeaways: {
      id: SUMMARY__SUMMARIZE_PAGE__KEY_TAKEAWAYS__PROMPT_ID,
      text: `[Summary] Summarize page (Key takeaways)`,
    },
  },
  PDF_CRX_SUMMARY: {
    all: {
      id: SUMMARY__SUMMARIZE_PDF__PROMPT_ID,
      text: `[Summary] Summarize PDF`,
    },
    summary: {
      id: SUMMARY__SUMMARIZE_PDF__TL_DR__PROMPT_ID,
      text: `[Summary] Summarize PDF (TL:DR)`,
    },
    keyTakeaways: {
      id: SUMMARY__SUMMARIZE_PDF__KEY_TAKEAWAYS__PROMPT_ID,
      text: `[Summary] Summarize PDF (Key takeaways)`,
    },
  },
  DEFAULT_EMAIL_SUMMARY: {
    all: {
      id: SUMMARY__SUMMARIZE_EMAIL__PROMPT_ID,
      text: `[Summary] Summarize email`,
    },
    summary: {
      id: SUMMARY__SUMMARIZE_EMAIL__TL_DR__PROMPT_ID,
      text: `[Summary] Summarize email (TL:DR)`,
    },
    keyTakeaways: {
      id: SUMMARY__SUMMARIZE_EMAIL__KEY_TAKEAWAYS__PROMPT_ID,
      text: `[Summary] Summarize email (Key takeaways)`,
    },
    actions: {
      id: SUMMARY__SUMMARIZE_EMAIL__ACTION_ITEMS__PROMPT_ID,
      text: '[Summary] Summarize email (Action items)',
    },
  },
  YOUTUBE_VIDEO_SUMMARY: {
    all: {
      id: SUMMARY__SUMMARIZE_VIDEO__PROMPT_ID,
      text: `[Summary] Summarize video`,
    },
    timestamped: {
      id: SUMMARY__TIMESTAMPED_SUMMARY__PROMPT_ID,
      text: '[Summary] Timestamped summary',
    },
    comment: {
      id: SUMMARY__SUMMARIZE_COMMENTS__PROMPT_ID,
      text: '[Summary] Summarize comments',
    },
    transcript: {
      id: SUMMARY__SHOW_TRANSCRIPT__PROMPT_ID,
      text: `[Summary] Show transcript`,
    },
    keyTakeaways: {
      id: SUMMARY__SUMMARIZE_VIDEO__KEY_TAKEAWAYS__PROMPT_ID,
      text: `[Summary] Summarize video (Key points)`,
    },
  },
}
