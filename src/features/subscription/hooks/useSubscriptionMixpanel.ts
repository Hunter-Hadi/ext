import { useMemo, useRef } from 'react'

import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import { mixpanelTrack } from '@/features/mixpanel/utils'

/**
 * 记录mixpanel
 * currentRole: guest | free | basic | pro | elite
 * currentPlan: GUEST | FREE | ...
 */
export const useSubscriptionMixpanel = () => {
  const { userInfo } = useUserInfo()

  const currentRole = useMemo(() => {
    switch (userInfo?.role?.name) {
      case 'free':
      case 'new_user':
      case 'pro_gift':
        return 'free'
      default:
        return userInfo?.role?.name || 'guest'
    }
  }, [userInfo?.role?.name])

  const currentPlan = useMemo(() => {
    // 如果当用户为free时，后端返回的 subscription_plan_name 为null
    // 这里需要处理 currentPlan === 'GUEST' && currentRole === 'free' 的情况
    const planName = userInfo?.subscription_plan_name || 'GUEST'
    if (planName === 'GUEST' && currentRole === 'free') {
      return 'FREE'
    }
    return planName
  }, [currentRole, userInfo?.subscription_plan_name])

  const trackSubscriptionFailedReminder = (eventType: 'showed' | 'clicked') => {
    mixpanelTrack(
      eventType === 'showed'
        ? 'subscription_failed_reminder_showed'
        : 'subscription_failed_reminder_clicked',
      {
        reminderType: 'TOPBAR',
        applicationType: 'EXTENSION',
        currentRole,
        currentPlan,
      },
    )
  }

  const trackSubscriptionFailedReminderRef = useRef(
    trackSubscriptionFailedReminder,
  )
  trackSubscriptionFailedReminderRef.current = trackSubscriptionFailedReminder

  return {
    trackSubscriptionFailedReminder,
    trackSubscriptionFailedReminderRef,
  }
}

export default useSubscriptionMixpanel
