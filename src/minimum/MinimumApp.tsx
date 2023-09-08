import React, { FC } from 'react'
import FloatingMenuButton from '@/minimum/components/FloatingMenuButton'
import MinimumAppInit from '@/minimum/MinimumAppInit'
import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'

const MinimumApp: FC = () => {
  const appSettings = useRecoilValue(AppSettingsState)
  console.log('MinimumApp appSettings', appSettings.userSettings?.quickAccess)
  return (
    <AppSuspenseLoadingLayout>
      <MinimumAppInit />
      {appSettings.userSettings?.quickAccess?.enabled && <FloatingMenuButton />}
    </AppSuspenseLoadingLayout>
  )
}
export default MinimumApp
