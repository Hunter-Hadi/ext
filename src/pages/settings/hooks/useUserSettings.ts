import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import { setChromeExtensionSettings } from '@/background/utils'
import { useCallback } from 'react'
import debounce from 'lodash-es/debounce'

export const useUserSettings = () => {
  const { syncLocalToServer } = useSyncSettingsChecker()
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const userSettings = appSettings.userSettings
  const debounceSetUserSettings = useCallback(
    debounce(syncLocalToServer, 1000),
    [syncLocalToServer],
  )
  const setUserSettings = useCallback(
    async (newUserSettings: typeof userSettings) => {
      setAppSettings({
        ...appSettings,
        userSettings: newUserSettings,
      })
      await setChromeExtensionSettings((settings) => {
        settings.userSettings = newUserSettings
        return settings
      })
      debounceSetUserSettings()
    },
    [debounceSetUserSettings],
  )
  return {
    userSettings,
    setUserSettings,
  }
}
