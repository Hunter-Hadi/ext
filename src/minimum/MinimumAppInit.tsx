import React, { FC, useEffect } from 'react'
import { useSetRecoilState } from 'recoil'

import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { useAuthLogin } from '@/features/auth'
import useInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { useInitChatGPTClient } from '@/features/chatgpt'
import useThemeUpdateListener from '@/features/contextMenu/hooks/useThemeUpdateListener'
import { AppDBStorageState, AppLocalStorageState } from '@/store'
import clientGetLiteChromeExtensionDBStorage from '@/utils/clientGetLiteChromeExtensionDBStorage'

const AppSettingsInit = () => {
  const setAppDBStorage = useSetRecoilState(AppDBStorageState)
  const setAppLocalStorage = useSetRecoilState(AppLocalStorageState)
  useThemeUpdateListener()
  useEffect(() => {
    const updateAppSettings = async () => {
      const liteChromeExtensionDBStorage =
        await clientGetLiteChromeExtensionDBStorage()
      if (liteChromeExtensionDBStorage) {
        setAppDBStorage({
          ...liteChromeExtensionDBStorage,
        })
        console.log('get db settings', liteChromeExtensionDBStorage)
      }
      const chromeExtensionLocalStorage = await getChromeExtensionLocalStorage()
      if (chromeExtensionLocalStorage) {
        setAppLocalStorage({
          ...chromeExtensionLocalStorage,
        })
        console.log('get local settings', chromeExtensionLocalStorage)
      }
    }
    updateAppSettings()
    window.addEventListener('focus', updateAppSettings)
    return () => {
      window.removeEventListener('focus', updateAppSettings)
    }
  }, [])
  return <></>
}
const MinimumAppInit: FC = () => {
  useInitChatGPTClient()
  useAuthLogin()
  useInitUserInfo()
  return (
    <>
      <AppSettingsInit />
    </>
  )
}
export default MinimumAppInit
