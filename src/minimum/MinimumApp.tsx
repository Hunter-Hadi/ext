import React, { FC, useState } from 'react'
import { useRecoilValue } from 'recoil'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import { useAuthLogin } from '@/features/auth/hooks/useAuthLogin'
import { MAXAI_SIDEBAR_ID } from '@/features/common/constants'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { OnboardingTooltipPortal } from '@/features/onboarding/components/OnboardingTooltip'
import FloatingMenuButton from '@/minimum/components/FloatingMenuButton'
import SpecialHostSummaryButton from '@/minimum/components/SpecialHostSummaryButton'
import MinimumAppInit from '@/minimum/MinimumAppInit'
import { AppDBStorageState } from '@/store'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const MinimumApp: FC = () => {
  const appDBStorage = useRecoilValue(AppDBStorageState)
  console.log('MinimumApp appDBStorage', appDBStorage.userSettings?.quickAccess)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isLogin } = useAuthLogin()

  useEffectOnce(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      const root = document.querySelector(`#${MAXAI_SIDEBAR_ID}`)
      // watch attribute change
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const isOpen = (
              mutation.target as HTMLDivElement
            )?.classList?.contains('open')
            setSidebarOpen(isOpen || false)
          }
        })
      })
      if (root) {
        clearInterval(timer)
        observer.observe(root, {
          attributes: true,
        })
      }
    }, 500)
  })

  const showMiniCtaButton = React.useMemo(() => {
    return appDBStorage.userSettings?.quickAccess?.enabled && !sidebarOpen
  }, [appDBStorage.userSettings?.quickAccess?.enabled, sidebarOpen])

  const ctaButtonOnboardingTooltipTrigger = React.useMemo(() => {
    if (showMiniCtaButton) {
      const currentDomain = getCurrentDomainHost()
      // 只有在 我们app网站里没登录的情况下不显示，其他页面不管登录不登录都需要显示
      if (
        currentDomain === 'app.maxai.me' ||
        // 对登录过程中的 google oauth2 页面做下特殊处理
        (currentDomain === 'accounts.google.com' &&
          location.pathname.startsWith('/o/oauth2'))
      ) {
        return isLogin
      } else {
        return true
      }
    }
  }, [isLogin, showMiniCtaButton])

  return (
    <AppSuspenseLoadingLayout>
      <MinimumAppInit />
      {showMiniCtaButton && <FloatingMenuButton />}
      <SpecialHostSummaryButton />
      {!sidebarOpen && (
        <OnboardingTooltipPortal
          sceneType='QUICK_ACCESS_CTA_BUTTON'
          // showStateTrigger={appDBStorage.userSettings?.quickAccess?.enabled}
          showStateTrigger={ctaButtonOnboardingTooltipTrigger}
        />
      )}
    </AppSuspenseLoadingLayout>
  )
}
export default MinimumApp
