import { useRecoilState } from 'recoil'
import { AppDBStorageState } from '@/store'
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import { useCallback } from 'react'
import debounce from 'lodash-es/debounce'
import { setChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'

export const useUserSettings = () => {
  const { syncLocalToServer } = useSyncSettingsChecker()
  const [appDBStorage, setAppDBStorage] = useRecoilState(AppDBStorageState)
  const userSettings = appDBStorage.userSettings
  const debounceSetUserSettings = useCallback(
    debounce(syncLocalToServer, 1000),
    [syncLocalToServer],
  )
  const setUserSettings = useCallback(
    async (newUserSettings: typeof userSettings) => {
      setAppDBStorage({
        ...appDBStorage,
        userSettings: newUserSettings,
      })
      await setChromeExtensionDBStorage((settings) => {
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
