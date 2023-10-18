import React, { FC, useState } from 'react'
import FloatingMenuButton from '@/minimum/components/FloatingMenuButton'
import MinimumAppInit from '@/minimum/MinimumAppInit'
import { useRecoilValue } from 'recoil'
import { AppDBStorageState } from '@/store'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import useEffectOnce from '@/hooks/useEffectOnce'
import { ROOT_CONTAINER_ID } from '@/constants'
import YouTubeSummaryButton from '@/minimum/components/YouTubeSummaryButton'

const MinimumApp: FC = () => {
  const appDBStorage = useRecoilValue(AppDBStorageState)
  console.log('MinimumApp appDBStorage', appDBStorage.userSettings?.quickAccess)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffectOnce(() => {
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      const root = document.querySelector(`#${ROOT_CONTAINER_ID}`)
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
      <YouTubeSummaryButton />
    </AppSuspenseLoadingLayout>
  )
}
export default MinimumApp
