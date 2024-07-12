import Box from '@mui/material/Box'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState, useRecoilValue } from 'recoil'

import WarningBar from '@/components/WarningBar'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useSubscriptionMixpanel from '@/features/subscription/hooks/useSubscriptionMixpanel'
import { UnableSubscriptionState } from '@/features/subscription/store'
import { AppState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

const UnableAutoSubscriptionBar = () => {
  const { t } = useTranslation(['client'])
  const { isSubscriptionPaymentFailed } = useUserInfo()
  const appState = useRecoilValue(AppState)
  const [unableSubscriptionState, setUnableSubscriptionState] = useRecoilState(
    UnableSubscriptionState,
  )
  const {
    trackSubscriptionFailedReminder,
    trackSubscriptionFailedReminderRef,
  } = useSubscriptionMixpanel()

  const { show, barHeight } = unableSubscriptionState

  /**
   * 打开sidebar的时候需要重新显示
   */
  useEffect(() => {
    if (!isMaxAIImmersiveChatPage() && !appState.open) return
    setUnableSubscriptionState((prev) => ({
      ...prev,
      show: isSubscriptionPaymentFailed,
    }))
  }, [appState.open, isSubscriptionPaymentFailed])

  /**
   * 显示记录mixpanel
   */
  useEffect(() => {
    if (show) {
      trackSubscriptionFailedReminderRef.current('showed')
    }
  }, [show])

  if (!show) return null

  return (
    <Box
      id='maxai-unable-subscription-bar'
      ref={(ref: any) => {
        if (ref && barHeight !== ref.offsetHeight) {
          setUnableSubscriptionState((prev) => ({
            ...prev,
            barHeight: ref.offsetHeight,
          }))
        }
      }}
    >
      <WarningBar
        title={t('client:sidebar__unable_subscription__title')}
        content={t('client:sidebar__unable_subscription__link__title')}
        href={`${APP_USE_CHAT_GPT_HOST}/my-plan`}
        onClick={() => trackSubscriptionFailedReminder('clicked')}
        onClose={() =>
          setUnableSubscriptionState((prev) => ({
            ...prev,
            show: false,
          }))
        }
      />
    </Box>
  )
}

export default UnableAutoSubscriptionBar
