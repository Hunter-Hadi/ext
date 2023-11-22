import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'
import { useQuery } from '@tanstack/react-query'
// [uuid, ...deps]
const useOwnPrompts = () => {
  return useQuery({
    queryKey: [PROMPT_LIBRARY_API.GET_OWN_PROMPTS],
    queryFn: PromptLibraryService.getOwnPrompts,
  })
}

export default useOwnPrompts
