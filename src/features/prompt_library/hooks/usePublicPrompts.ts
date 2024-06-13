import { keepPreviousData, useQuery } from '@tanstack/react-query'

import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'

const usePublicPrompts = () => {
  const { promptLibraryListParameters, updatePromptLibraryListParameters } =
    usePromptLibraryParameters()
  const { enabled, use_case, category, page, page_size, query } =
    promptLibraryListParameters
  return useQuery({
    queryKey: [
      PROMPT_LIBRARY_API.SEARCH_PROMPT,
      category,
      use_case,
      query,
      page,
      page_size,
    ],
    queryFn: async () => {
      const paginationData = await PromptLibraryService.getPublicPrompts(
        promptLibraryListParameters,
      )
      if (paginationData?.data) {
        updatePromptLibraryListParameters({
          total: paginationData.total,
        })
        return paginationData.data
      }
      throw new Error('Network error. Please try again.')
    },
    placeholderData: keepPreviousData,
    enabled,
    retry: false,
  })
}

export default usePublicPrompts
