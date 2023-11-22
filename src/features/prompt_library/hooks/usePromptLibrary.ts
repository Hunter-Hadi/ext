import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import { IPromptLibraryListParametersState } from '@/features/prompt_library/types'
import { useRecoilState } from 'recoil'
import { PromptLibraryState } from '@/features/prompt_library/store'

const usePromptLibrary = () => {
  const [promptLibrary, setPromptLibrary] = useRecoilState(PromptLibraryState)
  const { updatePromptLibraryListParameters } = usePromptLibraryParameters()
  const initPromptLibrary = (
    initParameters: Partial<IPromptLibraryListParametersState>,
  ) => {
    updatePromptLibraryListParameters({
      ...initParameters,
      enabled: true,
    })
  }
  const openPromptLibrary = () => {
    setPromptLibrary((prev) => {
      return {
        ...prev,
        open: true,
      }
    })
  }
  const closePromptLibrary = () => {
    setPromptLibrary((prev) => {
      return {
        ...prev,
        open: false,
      }
    })
  }
  return {
    promptLibraryOpen: promptLibrary.open,
    openPromptLibrary,
    closePromptLibrary,
    initPromptLibrary,
  }
}
export default usePromptLibrary
