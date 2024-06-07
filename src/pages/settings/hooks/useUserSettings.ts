import debounce from 'lodash-es/debounce'
import { useCallback } from 'react'
import { useRecoilState } from 'recoil'

import { setChromeExtensionDBStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorage'
import useSyncSettingsChecker from '@/pages/settings/hooks/useSyncSettingsChecker'
import { AppDBStorageState } from '@/store'

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
      await setChromeExtensionDBStorage((settings) => {
        console.log('TEST', newUserSettings)
        settings.userSettings = newUserSettings
        return settings
      })
      setAppDBStorage({
        ...appDBStorage,
        userSettings: newUserSettings,
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
