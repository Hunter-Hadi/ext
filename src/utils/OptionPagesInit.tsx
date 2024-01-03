import React, { useEffect } from 'react'
import { useSetRecoilState } from 'recoil'

import { getChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { AppSettingsInit } from '@/components/AppInit'
import userInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { useInitI18n } from '@/i18n/hooks'
import { AppDBStorageState, AppLocalStorageState } from '@/store'

const OptionPagesInit = () => {
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const setAppLocalStorage = useSetRecoilState(AppLocalStorageState)
  useInitI18n()
  userInitUserInfo()
  useEffect(() => {
    const updateSettings = async () => {
      setAppDBStorage(await getChromeExtensionDBStorage())
      setAppLocalStorage(await getChromeExtensionLocalStorage())
    }
    window.addEventListener('focus', updateSettings)
    updateSettings()
    return () => {
      window.removeEventListener('focus', updateSettings)
    }
  }, [])
  return (
    <>
      <AppSettingsInit />
    </>
  )
}

export default OptionPagesInit
