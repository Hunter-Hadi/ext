import { getChromeExtensionAccessToken } from '@/features/auth/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil'
import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_PROVIDER_MAP,
} from '../constants'
import { SearchWithAISettingsAtom } from '../store'
import {
  DEFAULT_SEARCH_WITH_AI_SETTING,
  getSearchWithAISettings,
  setSearchWithAISettings,
} from '../utils/searchWithAISettings'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const useSearchWithAISettingsInit = () => {
  const setSettings = useSetRecoilState(SearchWithAISettingsAtom)
  const firstLoaded = useRef(true)

  useEffect(() => {
    const updateAppSettings = async () => {
      const settings = await getSearchWithAISettings()
      if (settings) {
        if (firstLoaded.current) {
          // 这里需要特殊处理下
          // 如果当前选择了需要 登录maxai 的provider，并且又没有登录则切换会默认的 provider
          const needLoginProvider = [
            SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_CLAUDE,
            SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
          ] as ISearchWithAIProviderType[]
          if (needLoginProvider.includes(settings.aiProvider)) {
            const token = await getChromeExtensionAccessToken()
            if (!token) {
              settings.aiProvider = DEFAULT_SEARCH_WITH_AI_SETTING.aiProvider
              await setSearchWithAISettings({
                aiProvider: DEFAULT_SEARCH_WITH_AI_SETTING.aiProvider,
              })
              await port.postMessage({
                event: 'SWAI_switchAIProvider',
                data: {
                  provider: DEFAULT_SEARCH_WITH_AI_SETTING.aiProvider,
                },
              })
            }
          }

          setSettings({
            ...settings,
            loaded: true,
          })
          firstLoaded.current = false
        } else {
          setSettings((pre) => ({
            ...pre,
            ...settings,
          }))
        }
      }
    }
    updateAppSettings()
    // 监听自定义事件
    window.addEventListener('focus', updateAppSettings)
    return () => {
      window.removeEventListener('focus', updateAppSettings)
    }
  }, [])

  return null
}

export default useSearchWithAISettingsInit
