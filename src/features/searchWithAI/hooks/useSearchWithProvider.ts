import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { useCallback, useMemo, useState } from 'react'
import { ISearchWithAIProviderType } from '../constants'
import useSearchWithAISettings from './useSearchWithAISettings'

const port = new ContentScriptConnectionV2({
  runtime: 'client',
})

const useSearchWithProvider = () => {
  const [loading, setLoading] = useState(false)

  const { searchWithAISettings, setSearchWithAISettings } =
    useSearchWithAISettings()

  const currentProvider = useMemo(
    () => searchWithAISettings.aiProvider,
    [searchWithAISettings.aiProvider],
  )

  const switchProvider = useCallback(
    async (provider: ISearchWithAIProviderType) => {
      setLoading(true)
      await port.postMessage({
        event: 'SWAI_switchAIProvider',
        data: {
          provider,
        },
      })
      setSearchWithAISettings({
        aiProvider: provider,
      })
      setLoading(false)
    },
    [],
  )

  return {
    provider: currentProvider,
    updateChatGPTProvider: switchProvider,
    loading,
  }
}

export default useSearchWithProvider
