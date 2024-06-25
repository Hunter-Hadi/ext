import Browser from 'webextension-polyfill'

import { MaxAIExtensionIdManager } from '@/background/utils/extensionId'
import { PAGE_SUMMARY_NAV_LIST_MAP } from '@/features/chat-base/summary/constants'
import { IPageSummaryType } from '@/features/chat-base/summary/types'
import { YoutubeTranscript } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import { isEmailWebsite } from '@/features/shortcuts/utils/email/getEmailWebsitePageContentsOrDraft'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'
import { md5TextEncrypt } from '@/utils/encryptionHelper'

/**
 * 获取summary nav item
 * @param type
 * @param value
 * @param valueType
 */
export const getSummaryNavItemByType = (
  type: IPageSummaryType,
  value: string,
  valueType: 'key' | 'title' | 'icon' = 'key',
) => {
  if (valueType === 'key' && !value) value = 'all' //默认赋值，防止异常
  const summaryNavItem = PAGE_SUMMARY_NAV_LIST_MAP[type].find(
    (item) => item[valueType] === value,
  )
  if (valueType === 'key' && !summaryNavItem) {
    //防止summary nav key 找元素的时候，异常，因为nav有可能会删除
    return PAGE_SUMMARY_NAV_LIST_MAP[type].find(
      (item) => item[valueType] === 'all',
    )
  } else {
    return summaryNavItem
  }
}

/**
 * 根据当前url获取summary type
 */
export const getPageSummaryType = (): IPageSummaryType => {
  if (getCurrentDomainHost() === 'youtube.com') {
    if (YoutubeTranscript.retrieveVideoId(window.location.href)) {
      return 'YOUTUBE_VIDEO_SUMMARY'
    }
  }
  const url = new URL(location.href)
  const PDFViewerHref = `${Browser.runtime.id}/pages/pdf/web/viewer.html`
  if (url.href.includes(PDFViewerHref)) {
    return 'PDF_CRX_SUMMARY'
  }
  if (isEmailWebsite()) {
    return 'DEFAULT_EMAIL_SUMMARY'
  }
  return 'PAGE_SUMMARY'
}

const PAGE_SUMMARY_CONVERSATION_ID_MAP: {
  [key in string]: string
} = {}

/**
 * 获取当前页面conversationId
 * @param url
 */
export const getPageSummaryConversationId = (url?: string) => {
  const pageUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '')
  if (!PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl]) {
    PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl] = md5TextEncrypt(
      pageUrl + MaxAIExtensionIdManager.MaxAIExtensionId,
    )
  }
  return PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl]
}
