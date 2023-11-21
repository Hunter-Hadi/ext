import { useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'
import { SelectPromptIdAtom } from '@/features/prompt_library/store'
import { IPromptType } from '@/features/prompt_library/types'

const UPDATE_SELECT_PROMPT_EVENT = 'SELECT_PROMPT_EVENT'

const useSelectPromptController = () => {
  const [selectPromptId, setSelectPromptId] = useRecoilState(SelectPromptIdAtom)
  const [selectPromptType, setSelectPromptType] = useState<IPromptType | null>(
    null,
  )

  const updateSelectPromptId = (
    id: string | null,
    promptType: IPromptType = 'public',
  ) => {
    window.dispatchEvent(
      new CustomEvent(UPDATE_SELECT_PROMPT_EVENT, {
        detail: {
          promptId: id,
          promptType: promptType,
        },
      }),
    )
  }

  useEffect(() => {
    const listener = (event: any) => {
      setSelectPromptId(event.detail?.promptId || null)
      setSelectPromptType(event.detail?.promptType || '')
    }

    window.addEventListener(UPDATE_SELECT_PROMPT_EVENT, listener)

    return () => {
      window.removeEventListener(UPDATE_SELECT_PROMPT_EVENT, listener)
    }
  }, [])

  return {
    selectPromptType,
    selectPromptId,
    updateSelectPromptId,
  }
}

export default useSelectPromptController
