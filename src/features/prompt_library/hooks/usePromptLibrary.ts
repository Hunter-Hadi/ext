import { useRecoilState } from 'recoil'

import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import { PromptLibraryState } from '@/features/prompt_library/store'
import {
  IPromptLibraryCardData,
  IPromptLibraryListParametersState,
} from '@/features/prompt_library/types'

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
  const selectPromptLibraryCard = (
    promptLibraryCard: IPromptLibraryCardData,
  ) => {
    setPromptLibrary((prev) => {
      return {
        ...prev,
        selectedPromptLibraryCard: promptLibraryCard,
      }
    })
  }
  const cancelSelectPromptLibraryCard = () => {
    return setPromptLibrary((prev) => {
      return {
        ...prev,
        selectedPromptLibraryCard: null,
      }
    })
  }
  return {
    selectedPromptLibraryCard: promptLibrary.selectedPromptLibraryCard,
    selectPromptLibraryCard,
    cancelSelectPromptLibraryCard,
    promptLibrary,
    promptLibraryOpen: promptLibrary.open,
    openPromptLibrary,
    closePromptLibrary,
    initPromptLibrary,
  }
}
export default usePromptLibrary
