import { useQuery } from '@tanstack/react-query'

import usePromptLibraryAuth from '@/features/prompt_library/hooks/usePromptLibraryAuth'
import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'
// [uuid, ...deps]
const useFavoritePrompts = () => {
  const { isLogin } = usePromptLibraryAuth()
  return useQuery({
    queryKey: [PROMPT_LIBRARY_API.GET_FAVOURITE_PROMPTS],
    queryFn: PromptLibraryService.getFavouritePrompts,
    enabled: isLogin,
    retry: false,
  })
}

export default useFavoritePrompts
