import { useRecoilState } from 'recoil'
import { SourcesStatusAtom } from '../store'

const useSourcesStatus = () => {
  const [sourcesStatus, setSourcesStatus] = useRecoilState(SourcesStatusAtom)

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

export default useSourcesStatus
