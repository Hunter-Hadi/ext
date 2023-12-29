import { useRecoilState } from 'recoil'

import { SearchWithAISourcesState } from '../store'

const useSearchWithAISources = () => {
  const [sourcesStatus, setSourcesStatus] = useRecoilState(
    SearchWithAISourcesState,
  )

  const startSourcesLoading = () => {
    setSourcesStatus({
      ...sourcesStatus,
      loading: true,
    })
  }

  const setSources = (sources: any) => {
    setSourcesStatus({
      ...sourcesStatus,
      loading: false,
      sources,
    })
  }

  const clearSources = () => {
    setSourcesStatus({
      ...sourcesStatus,
      loading: false,
      sources: [],
    })
  }

  return {
    loading: sourcesStatus.loading,
    sources: sourcesStatus.sources,
    startSourcesLoading,
    setSources,
    clearSources,
  }
}

export default useSearchWithAISources
