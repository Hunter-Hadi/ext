import { useRecoilValue } from 'recoil'

import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { AuthState } from '@/features/auth/store'
import {
  getMaxAIChromeExtensionUserFeatureQuota,
  setMaxAIChromeExtensionUserFeatureUsage,
} from '@/features/auth/utils'
import { IPageSummaryType } from '@/features/chat-base/summary/types'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'

export type IFeatureQuotaType =
  | 'summary'
  | 'context_menu'
  | 'search'
  | 'instant_reply'

const useUserFeatureQuota = () => {
  const { isPayingUser } = useUserInfo()
  const { isLogin } = useRecoilValue(AuthState)

  const getFeatureQuota = async (
    featureType: IFeatureQuotaType,
    summaryType?: IPageSummaryType,
  ) => {
    const info = await getMaxAIChromeExtensionUserFeatureQuota()

    switch (featureType) {
      case 'summary': {
        if (!summaryType) summaryType = getPageSummaryType()
        if (summaryType === 'PDF_CRX_SUMMARY') {
          return {
            key: 'summarizePDFUsage',
            maxCount: info.summarizePDFMaxCnt,
            usage: info.summarizePDFUsage,
          }
        } else if (summaryType === 'YOUTUBE_VIDEO_SUMMARY') {
          return {
            key: 'summarizeYoutubeUsage',
            maxCount: info.summarizeYoutubeMaxCnt,
            usage: info.summarizeYoutubeUsage,
          }
        } else {
          // page和email等都属于page用量分类
          return {
            key: 'summarizePageUsage',
            maxCount: info.summarizePageMaxCnt,
            usage: info.summarizePageUsage,
          }
        }
      }
      case 'context_menu':
        return {
          key: 'contextMenuUsage',
          maxCount: info.contextMenuMaxCnt,
          usage: info.contextMenuUsage,
        }
      case 'search':
        return {
          key: 'searchUsage',
          maxCount: info.searchMaxCnt,
          usage: info.searchUsage,
        }
      case 'instant_reply':
        return {
          key: 'instantReplyUsage',
          maxCount: info.instantReplyMaxCnt,
          usage: info.instantReplyUsage,
        }
    }
  }

  const checkFeatureQuota = async (
    featureType: IFeatureQuotaType,
    summaryType?: IPageSummaryType,
  ) => {
    // 如果是付费用户，这里不做用量限制，由后端控制
    if (isPayingUser) {
      return true
    }
    // 未登录不做用量检测
    if (!isLogin) {
      return true
    }
    // 免费用户检测用量
    const { key, maxCount, usage } = await getFeatureQuota(
      featureType,
      summaryType,
    )

    if (usage < maxCount) {
      // 如果没用完，增加一次使用次数
      await setMaxAIChromeExtensionUserFeatureUsage(key as any, usage + 1)
      return true
    } else {
      // 已用完，展示付费卡点
      // await ClientConversationMessageManager.deleteMessages(
      //   conversationId,
      //   await ClientConversationMessageManager.getMessageIds(
      //     conversationId,
      //   ),
      // )
      // await pushPricingHookMessage('PAGE_SUMMARY')
      // authEmitPricingHooksLog('show', 'PAGE_SUMMARY', {
      //   conversationId: currentConversationId,
      //   paywallType: 'RESPONSE',
      // })
      return false
    }
  }

  return { getFeatureQuota, checkFeatureQuota }
}

export default useUserFeatureQuota
