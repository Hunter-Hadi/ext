import { useQuery } from '@tanstack/react-query'

import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'
// [uuid, ...deps]
const useOwnPrompts = () => {
  return useQuery({
    queryKey: [PROMPT_LIBRARY_API.GET_OWN_PROMPTS],
    queryFn: PromptLibraryService.getOwnPrompts,
  })
}

export default useOwnPrompts
