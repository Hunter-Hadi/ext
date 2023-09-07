import React, { FC } from 'react'
import FloatingMenuButton from '@/minimum/components/FloatingMenuButton'
import MinimumAppInit from '@/minimum/MinimumAppInit'
import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'

const MinimumApp: FC = () => {
  const appSettings = useRecoilValue(AppSettingsState)
  return (
    <>
      <MinimumAppInit />
      {appSettings.userSettings?.quickAccess?.enabled && <FloatingMenuButton />}
    </>
  )
}
export default MinimumApp
