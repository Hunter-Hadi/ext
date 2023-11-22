import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'

import useFavoritePrompts from '@/features/prompt_library/hooks/useFavoritePrompts'
import usePublicPrompts from '@/features/prompt_library/hooks/usePublicPrompts'
import { useMemo } from 'react'
import useOwnPrompts from '@/features/prompt_library/hooks/useOwnPrompts'

const usePromptLibraryList = () => {
  const { activeTab } = usePromptLibraryParameters()
  const favoritesPrompts = useFavoritePrompts()
  const publicPrompts = usePublicPrompts()
  const ownPrompts = useOwnPrompts()
  return useMemo(() => {
    if (activeTab === 'Favorites') {
      return favoritesPrompts
    }
    if (activeTab === 'Own') {
      return ownPrompts
    }
    return publicPrompts
  }, [activeTab, publicPrompts, favoritesPrompts])
}
export default usePromptLibraryList
