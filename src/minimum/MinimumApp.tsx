import React, { FC, useState } from 'react'
import { useRecoilValue } from 'recoil'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import { MAXAI_SIDEBAR_ID } from '@/features/common/constants'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import FloatingMenuButton from '@/minimum/components/FloatingMenuButton'
import SpecialHostSummaryButton from '@/minimum/components/SpecialHostSummaryButton'
import MinimumAppInit from '@/minimum/MinimumAppInit'
import { AppDBStorageState } from '@/store'

const MinimumApp: FC = () => {
  const appDBStorage = useRecoilValue(AppDBStorageState)
  console.log('MinimumApp appDBStorage', appDBStorage.userSettings?.quickAccess)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffectOnce(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      const root = document.querySelector(`#${MAXAI_SIDEBAR_ID}`)
      // watch attribute change
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes') {
            const isOpen = (mutation.target as HTMLDivElement)?.classList?.contains(
              'open',
            )
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
  return (
    <AppSuspenseLoadingLayout>
      <MinimumAppInit />
      {appDBStorage.userSettings?.quickAccess?.enabled && !sidebarOpen && (
        <FloatingMenuButton />
      )}
      <SpecialHostSummaryButton />
    </AppSuspenseLoadingLayout>
  )
}
export default MinimumApp
