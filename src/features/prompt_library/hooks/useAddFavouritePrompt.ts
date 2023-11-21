import { useState } from 'react'
import { useSetRecoilState } from 'recoil'

import { IPromptType } from '@/features/prompt_library/types'
import { promptActionToast as Toast } from '@/features/prompt_library/utils'
import { post } from '@/utils/request'

import { FavoritesPromptIdsAtom } from '@/features/prompt_library/store'
import { PROMPT_LIBRARY_API } from '@/features/prompt_library/service'

export interface IAddPromptParams {
  type: IPromptType
  prompt_hint: string
  prompt_template: string
  prompt_title: string
  teaser: string
  category: string
  use_case: string
  user_input?: string
  optional_prompt_template?: string
  author?: string
  author_url?: string
}

const useFavouriteActionsPrompt = () => {
  const setFavoritesPromptIds = useSetRecoilState(FavoritesPromptIdsAtom)
  const [loading, setLoading] = useState(false)

  const addFavouritePrompt = async (id: string) => {
    try {
      setLoading(true)
      const res = await post<{ id: string }>(
        PROMPT_LIBRARY_API.ADD_FAVOURITE_PROMPT,
        {
          id,
        },
      )
      if (res.status === 'OK') {
        Toast.success('Added to "Favorites" prompts list.')
        setFavoritesPromptIds((ids) => [...ids, id])
        return true
      }
      return false
    } catch (error) {
      console.error('Add favourite prompt error', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const removeFavouritePrompt = async (id: string) => {
    try {
      setLoading(true)
      const res = await post<{ id: string }>(
        PROMPT_LIBRARY_API.REMOVE_FAVOURITE_PROMPT,
        {
          id,
        },
      )
      if (res.status === 'OK') {
        Toast.success('Removed from "Favorites" prompts list.')
        setFavoritesPromptIds((ids) => ids.filter((item) => item !== id))
        return true
      }
      return false
    } catch (error) {
      console.error('Add favourite prompt error', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    addFavouritePrompt,
    removeFavouritePrompt,
    loading,
  }
}
export default useFavouriteActionsPrompt
