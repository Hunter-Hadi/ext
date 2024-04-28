import { useCallback, useMemo } from 'react'
import { useRecoilState } from 'recoil'

import { ContentScriptConnectionV2 } from '@/features/chatgpt'

import { ISearchWithAIProviderType } from '../constants'
import { SearchWithAIProviderLoadingAtom } from '../store'
import useSearchWithAISettings from './useSearchWithAISettings'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const useSearchWithProvider = () => {
  const [loading, setLoading] = useRecoilState(SearchWithAIProviderLoadingAtom)
  const { searchWithAISettings, setSearchWithAISettings } =
    useSearchWithAISettings()

  const currentProvider = useMemo(
    () => searchWithAISettings.aiProvider,
    [searchWithAISettings.aiProvider],
  )

  const switchProvider = useCallback(
    async (provider: ISearchWithAIProviderType) => {
      setLoading(true)
      setSearchWithAISettings({
        aiProvider: provider,
      })
      await port.postMessage({
        event: 'SWAI_switchAIProvider',
        data: {
          provider,
        },
      })
      setLoading(false)
    },
    [],
  )

  return {
    provider: currentProvider,
    updateChatGPTProvider: switchProvider,
    loading: loading,
  }
}

export default useSearchWithProvider
