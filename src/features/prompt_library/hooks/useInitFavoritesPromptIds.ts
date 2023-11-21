import { useCallback, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

import { FavoritesPromptIdsAtom } from '@/features/prompt_library/store'
import { IFavoritesPromptListRespeonse } from '@/features/prompt_library/types'
import { post } from '@/utils/request'
import { PROMPT_LIBRARY_API } from '@/features/prompt_library/service'
import usePromptLibraryAuth from '@/features/prompt_library/hooks/usePromptLibraryAuth'

const useInitFavoritesPromptIds = (isInit = true) => {
  const { isLogin } = usePromptLibraryAuth()
  const [loaded, setLoaded] = useState(false)
  const [favoritesPromptIds, setFavoritesPromptIds] = useRecoilState(
    FavoritesPromptIdsAtom,
  )

  const updateFavoritesPromptIds = useCallback(async () => {
    try {
      console.log(`我触发了 updateFavoritesPromptIds`)
      const res = await post<IFavoritesPromptListRespeonse>(
        PROMPT_LIBRARY_API.GET_FAVOURITE_PROMPTS,
        {},
      )
      if (res?.data && res?.data?.favourite_prompts) {
        const data = res.data.favourite_prompts
        const favoritePromptIds = data.map((item) => item.id)
        setFavoritesPromptIds(favoritePromptIds)
        setLoaded(true)
        return favoritePromptIds
      }
      return favoritesPromptIds
    } catch (error) {
      console.log(`updateFavoritesPromptIds error`, error)
      return favoritesPromptIds
    }
  }, [])

  useEffect(() => {
    if (!loaded && isLogin && isInit) {
      updateFavoritesPromptIds()
    }
  }, [isInit, loaded, isLogin, updateFavoritesPromptIds])

  return {
    isLogin,
    favoritesPromptIds,
    updateFavoritesPromptIds,
  }
}

export default useInitFavoritesPromptIds
