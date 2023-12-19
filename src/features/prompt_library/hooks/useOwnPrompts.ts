import { useQuery } from '@tanstack/react-query'

import usePromptLibraryAuth from '@/features/prompt_library/hooks/usePromptLibraryAuth'
import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'
// [uuid, ...deps]
const useOwnPrompts = () => {
  const { isLogin } = usePromptLibraryAuth()
  return useQuery({
    queryKey: [PROMPT_LIBRARY_API.GET_OWN_PROMPTS],
    queryFn: PromptLibraryService.getOwnPrompts,
    enabled: isLogin,
  })
}

export default useOwnPrompts
