import { useInitChatGPTClient } from '@/features/chatgpt'
import { useAuthLogin } from '@/features/auth/hooks'
import userInitUserInfo from '@/features/auth/hooks/useInitUserInfo'
import { useInitI18n } from '@/i18n/hooks'
import React, { FC, useEffect } from 'react'
import { useSetRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import useThemeUpdateListener from '@/features/contextMenu/hooks/useThemeUpdateListener'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
import { setChromeExtensionSettings } from '@/background/utils'

const AppSettingsInit = () => {
  const setAppSettings = useSetRecoilState(AppSettingsState)
  useThemeUpdateListener()
  useEffect(() => {
    const updateAppSettings = async () => {
      const settings = await clientGetLiteChromeExtensionSettings()
      if (settings) {
        setAppSettings({
          ...settings,
        })
        if (settings.userSettings && !settings.userSettings?.colorSchema) {
          const defaultColorSchema = window.matchMedia(
            '(prefers-color-scheme: dark)',
          ).matches
            ? 'dark'
            : 'light'
          await setChromeExtensionSettings({
            userSettings: {
              ...settings.userSettings,
              colorSchema: defaultColorSchema,
            },
          })
          setAppSettings({
            ...settings,
            userSettings: {
              ...settings.userSettings,
              colorSchema: defaultColorSchema,
            },
          })
        }
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
  userInitUserInfo()
  useInitI18n()
  return (
    <>
      <AppSettingsInit />
    </>
  )
}
export default MinimumAppInit
