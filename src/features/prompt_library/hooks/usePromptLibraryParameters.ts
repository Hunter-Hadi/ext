import { useRecoilState } from 'recoil'
import { PromptLibraryListParametersState } from '@/features/prompt_library/store'
import { IPromptListType } from '@/features/prompt_library/types'

/**
 * 管理PromptLibrary列表的搜索条件
 * @since 2023-11-21
 */
const usePromptLibraryParameters = () => {
  const [
    promptLibraryListParametersState,
    setPromptLibraryListParameters,
  ] = useRecoilState(PromptLibraryListParametersState)
  /**
   * 更新PromptLibrary列表的搜索条件
   * @param newParameters
   */
  const updatePromptLibraryListParameters = (
    newParameters: Partial<typeof promptLibraryListParametersState>,
  ) => {
    setPromptLibraryListParameters((preValue) => ({
      ...preValue,
      ...newParameters,
    }))
  }
  /**
   * 更新选中的Tab
   * @param activeTab
   */
  const updateActiveTab = (activeTab: IPromptListType) => {
    updatePromptLibraryListParameters({ activeTab })
  }
  const updateSearchQuery = (searchQuery: string) => {
    updatePromptLibraryListParameters({ query: searchQuery })
  }
  return {
    promptLibraryListParametersState,
    activeTab: promptLibraryListParametersState.activeTab,
    searchQuery: promptLibraryListParametersState.query,
    updatePromptLibraryListParameters,
    updateActiveTab,
    updateSearchQuery,
  }
}
export default usePromptLibraryParameters
