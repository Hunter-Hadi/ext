import { useMemo } from 'react'
import { useRecoilState } from 'recoil'

import { IAIProviderType } from '@/background/provider/chat'
import {
  getAIProviderSettings,
  setAIProviderSettings,
} from '@/background/src/chat/util'
import {
  getChromeExtensionLocalStorage,
  MAXAI_DEFAULT_AI_PROVIDER_CONFIG,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { IThirdProviderSettings } from '@/background/utils/chromeExtensionStorage/type'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { AppLocalStorageState } from '@/store'

const useThirdProviderSettings = () => {
  const [appLocalStorage, setAppLocalStorage] =
    useRecoilState(AppLocalStorageState)
  const { currentSidebarConversation } = useSidebarSettings()
  const currentProvider =
    currentSidebarConversation?.meta.AIProvider ||
    MAXAI_DEFAULT_AI_PROVIDER_CONFIG.AIProvider
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
      return await getAIProviderSettings(providerKey)
    } catch (e) {
      console.log(e)
      return undefined
    }
  }
  const saveThirdProviderSettings = async <T extends IAIProviderType>(
    providerKey: T,
    settings: Partial<IThirdProviderSettings[T]>,
  ) => {
    const success = await setAIProviderSettings(providerKey, settings)
    console.log(
      '新版Conversation 更新saveThirdProviderSettings',
      providerKey,
      settings,
    )
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
  const [appLocalStorage, setAppLocalStorage] =
    useRecoilState(AppLocalStorageState)
  const providerSettings = useMemo(() => {
    return appLocalStorage.thirdProviderSettings?.[providerKey] as
      | IThirdProviderSettings[T]
      | undefined
  }, [appLocalStorage.thirdProviderSettings, providerKey])
  const updateThirdProviderSettings = async (
    settings: Partial<IThirdProviderSettings[T]>,
  ) => {
    const success = await setAIProviderSettings(providerKey, settings)
    if (success) {
      setAppLocalStorage(await getChromeExtensionLocalStorage())
    }
  }
  return [providerSettings, updateThirdProviderSettings] as const
}
export default useThirdProviderSettings
