import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { OnBoardingKeyType } from '@/background/utils/chromeExtensionStorage/chromeExtensionOnboardingStorage'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { IPageSummaryType } from '@/features/chat-base/summary/types'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'

const SUMMARY_QUOTA_KEYS: Record<IPageSummaryType, OnBoardingKeyType> = {
  PDF_CRX_SUMMARY:
    'ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_PDF_CRX_SUMMARY_TIMES',
  YOUTUBE_VIDEO_SUMMARY:
    'ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_YOUTUBE_VIDEO_SUMMARY_TIMES',
  // EMAIL和PAGE都属于PAGE分类用量
  PAGE_SUMMARY: 'ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_PAGE_SUMMARY_TIMES',
  DEFAULT_EMAIL_SUMMARY:
    'ON_BOARDING_RECORD_SUMMARY_FREE_TRIAL_PAGE_SUMMARY_TIMES',
}

const useSummaryQuota = () => {
  const { isPayingUser, userInfo } = useUserInfo()

  const getSummaryQuota = async (summaryType = getPageSummaryType()) => {
    const data = await getChromeExtensionOnBoardingData()
    return Number(data[SUMMARY_QUOTA_KEYS[summaryType]]) || 0
  }

  const checkSummaryQuota = async (summaryType = getPageSummaryType()) => {
    // 如果是付费用户，这里不做用量限制，由后端控制
    if (isPayingUser) {
      return true
    }
    // 如果是不是free trial用户，直接返回false
    if (userInfo?.role?.name !== 'free_trial') {
      return false
    }
    // 判断lifetimes free trial是否已经用完
    const surplusQuota = await getSummaryQuota(summaryType)

    if (surplusQuota > 0) {
      // 如果没有用完，那么就减一
      await setChromeExtensionOnBoardingData(
        SUMMARY_QUOTA_KEYS[summaryType],
        surplusQuota - 1,
      )
      return true
    } else {
      // 已用完
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

  return { getSummaryQuota, checkSummaryQuota }
}

export default useSummaryQuota
