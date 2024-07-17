/**
 * @deprecated summary相关功能已移动到chat-base/summary下，防止冲突合并release后上线前删除
 */
import { MaxAIInstalledDeviceIdManager } from '@/background/utils/getMaxAIChromeExtensionInstalledDeviceId'
import { md5TextEncrypt } from '@/features/security'

const PAGE_SUMMARY_CONVERSATION_ID_MAP: {
  [key in string]: string
} = {}

export const getPageSummaryConversationId = (url?: string) => {
  const pageUrl =
    url || (typeof window !== 'undefined' ? window.location.href : '')
  if (!PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl]) {
    PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl] = md5TextEncrypt(
      pageUrl + MaxAIInstalledDeviceIdManager.MaxAIExtensionId,
    )
  }
  return PAGE_SUMMARY_CONVERSATION_ID_MAP[pageUrl]
}
