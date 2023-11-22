import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'
import { useQuery } from '@tanstack/react-query'
// [uuid, ...deps]
const useFavoritePrompts = () => {
  return useQuery({
    queryKey: [PROMPT_LIBRARY_API.GET_FAVOURITE_PROMPTS],
    queryFn: PromptLibraryService.getFavouritePrompts,
  })
}

export default useFavoritePrompts
