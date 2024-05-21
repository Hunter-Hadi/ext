import { MaxAIExtensionIdManager } from '@/background/utils/extensionId'
import { md5TextEncrypt } from '@/utils/encryptionHelper'

const PAGE_SUMMARY_CONVERSATION_ID_MAP: {
  [key in string]: string
} = {}

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
