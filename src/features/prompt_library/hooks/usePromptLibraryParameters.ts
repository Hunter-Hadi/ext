import { useRecoilState } from 'recoil'

import { PromptLibraryListParametersState } from '@/features/prompt_library/store'
import { IPromptListType } from '@/features/prompt_library/types'

/**
 * 管理PromptLibrary列表的搜索条件
 * @since 2023-11-21
 */
const usePromptLibraryParameters = () => {
  const [promptLibraryListParameters, setPromptLibraryListParameters] =
    useRecoilState(PromptLibraryListParametersState)
  /**
   * 更新PromptLibrary列表的搜索条件
   * @param newParameters
   */
  const updatePromptLibraryListParameters = (
    newParameters: Partial<typeof promptLibraryListParameters>,
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
    updatePromptLibraryListParameters({ query: searchQuery, page: 0 })
  }

  return {
    promptLibraryListParameters,
    activeTab: promptLibraryListParameters.activeTab,
    searchQuery: promptLibraryListParameters.query,
    updatePromptLibraryListParameters,
    updateActiveTab,
    updateSearchQuery,
  }
}

export default usePromptLibraryParameters
