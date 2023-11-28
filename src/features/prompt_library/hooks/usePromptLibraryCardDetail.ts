import { useQuery } from '@tanstack/react-query'
import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'

import {
  IPromptLibraryCardDetailData,
  IPromptLibraryCardType,
} from '@/features/prompt_library/types'

const usePromptLibraryCardDetail = (
  promptCardId: string,
  type: IPromptLibraryCardType,
) => {
  return useQuery({
    queryKey: [PROMPT_LIBRARY_API.GET_PROMPT_DETAIL, promptCardId, type],
    queryFn: async () => {
      if (promptCardId === 'NEW_PROMPT') {
        const newPromptDetail: IPromptLibraryCardDetailData = {
          id: '',
          prompt_template: '',
          teaser: '',
          prompt_hint: '',
          prompt_title: '',
          category: 'Other',
          use_case: 'Other',
          type: 'private',
          author: '',
          author_url: '',
          variables: [],
        }
        return newPromptDetail
      }
      return await (type === 'private'
        ? PromptLibraryService.getPrivatePromptDetail(promptCardId)
        : PromptLibraryService.getPublicPromptDetail(promptCardId))
    },
    enabled: promptCardId !== '',
  })
}
export default usePromptLibraryCardDetail
