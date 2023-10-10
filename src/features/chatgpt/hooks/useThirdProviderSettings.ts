import { useRecoilState } from 'recoil'
import { AppLocalStorageState } from '@/store'
import { useMemo } from 'react'
import { IAIProviderType } from '@/background/provider/chat'
import {
  getThirdProviderSettings,
  setThirdProviderSettings,
} from '@/background/src/chat/util'
import { IThirdProviderSettings } from '@/background/utils/chromeExtensionStorage/type'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'

const useThirdProviderSettings = () => {
  const [appLocalStorage, setAppLocalStorage] = useRecoilState(
    AppLocalStorageState,
  )
  const currentProvider = appLocalStorage.currentAIProvider
  const currentThirdProviderSettings = useMemo(() => {
    if (
      appLocalStorage.thirdProviderSettings &&
      currentProvider &&
      appLocalStorage['thirdProviderSettings'][currentProvider]
    ) {
      return appLocalStorage.thirdProviderSettings?.[currentProvider] as any
    }
    return undefined
  }, [currentProvider, appLocalStorage.thirdProviderSettings])
  const fetchThirdProviderSettings = async <T extends IAIProviderType>(
    providerKey: T,
  ) => {
    try {
      return await getThirdProviderSettings(providerKey)
    } catch (e) {
      console.log(e)
      return undefined
    }
  }
  const saveThirdProviderSettings = async <T extends IAIProviderType>(
    providerKey: T,
    settings: Partial<IThirdProviderSettings[T]>,
  ) => {
    const success = await setThirdProviderSettings(providerKey, settings)
    if (success) {
      setAppLocalStorage(await getChromeExtensionLocalStorage())
    }
  }
  return {
    fetchThirdProviderSettings,
    saveThirdProviderSettings,
    currentThirdProviderSettings,
  }
}

export const useSingleThirdProviderSettings = <T extends IAIProviderType>(
  providerKey: T,
) => {
  const [appLocalStorage, setAppLocalStorage] = useRecoilState(
    AppLocalStorageState,
  )
  const providerSettings = useMemo(() => {
    return appLocalStorage.thirdProviderSettings?.[providerKey] as
      | IThirdProviderSettings[T]
      | undefined
  }, [appLocalStorage.thirdProviderSettings, providerKey])
  const updateThirdProviderSettings = async (
    settings: Partial<IThirdProviderSettings[T]>,
  ) => {
    const success = await setThirdProviderSettings(providerKey, settings)
    if (success) {
      setAppLocalStorage(await getChromeExtensionLocalStorage())
    }
  }
  return [providerSettings, updateThirdProviderSettings] as const
}
export default useThirdProviderSettings
