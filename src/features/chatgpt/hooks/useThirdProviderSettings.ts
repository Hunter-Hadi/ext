import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { useMemo } from 'react'
import { IAIProviderType } from '@/background/provider/chat'
import {
  getThirdProviderSettings,
  setThirdProviderSettings,
} from '@/background/src/chat/util'
import { IThirdProviderSettings } from '@/background/types/Settings'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'

const useThirdProviderSettings = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const currentProvider = appSettings.currentAIProvider
  const currentThirdProviderSettings = useMemo(() => {
    if (
      appSettings.thirdProviderSettings &&
      currentProvider &&
      appSettings['thirdProviderSettings'][currentProvider]
    ) {
      return appSettings.thirdProviderSettings?.[currentProvider] as any
    }
    return undefined
  }, [currentProvider, appSettings.thirdProviderSettings])
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
    const success = await setThirdProviderSettings(providerKey, settings, false)
    if (success) {
      setAppSettings(await clientGetLiteChromeExtensionSettings())
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
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const providerSettings = useMemo(() => {
    return appSettings.thirdProviderSettings?.[providerKey] as
      | IThirdProviderSettings[T]
      | undefined
  }, [appSettings.thirdProviderSettings, providerKey])
  const updateThirdProviderSettings = async (
    settings: Partial<IThirdProviderSettings[T]>,
  ) => {
    const success = await setThirdProviderSettings(providerKey, settings, false)
    if (success) {
      setAppSettings(await clientGetLiteChromeExtensionSettings())
    }
  }
  return [providerSettings, updateThirdProviderSettings] as const
}
export default useThirdProviderSettings
