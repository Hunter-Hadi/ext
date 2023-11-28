import { promptActionToast as Toast } from '@/features/prompt_library/utils'
import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRecoilState } from 'recoil'
import { PromptLibraryState } from '@/features/prompt_library/store'
import { v4 as uuidV4 } from 'uuid'

const usePromptActions = () => {
  const [promptLibrary, setPromptLibrary] = useRecoilState(PromptLibraryState)
  const queryClient = useQueryClient()
  const openPromptLibraryEditForm = (promptId?: string) => {
    setPromptLibrary((prev) => {
      return {
        ...prev,
        editPromptId: promptId || uuidV4(),
      }
    })
  }
  const closePromptLibraryEditForm = () => {
    setPromptLibrary((prev) => {
      return {
        ...prev,
        editPromptId: '',
      }
    })
  }
  const addFavoritePromptMutation = useMutation({
    mutationFn: PromptLibraryService.addFavoritePrompt,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: [PROMPT_LIBRARY_API.GET_FAVOURITE_PROMPTS],
      })
    },
  })
  const removeFavoritePromptMutation = useMutation({
    mutationFn: PromptLibraryService.removeFavoritePrompt,
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: [PROMPT_LIBRARY_API.GET_FAVOURITE_PROMPTS],
      })
    },
  })
  const addPromptLibraryCardMutation = useMutation({
    mutationFn: PromptLibraryService.addPrivatePrompt,
    onSuccess: () => {
      Toast.success('Add prompt success')
      queryClient.refetchQueries({
        queryKey: [PROMPT_LIBRARY_API.GET_OWN_PROMPTS],
      })
    },
    onError: async (error) => {
      const errorData = (await (error as any)?.json?.()) || {}
      let errorMsg = errorData?.detail || ''
      if (errorMsg.includes('too long')) {
        errorMsg = 'The template is too long. Please shorten it.'
      }
      Toast.error(errorMsg || 'Add prompt failed, please try again later')
    },
  })
  const editPromptLibraryCardMutation = useMutation({
    mutationFn: PromptLibraryService.editPrivatePrompt,
    onSuccess: () => {
      Toast.success('Add prompt success')
      queryClient.refetchQueries({
        queryKey: [PROMPT_LIBRARY_API.GET_OWN_PROMPTS],
      })
    },
    onError: async (error) => {
      const errorData = (await (error as any)?.json?.()) || {}
      let errorMsg = errorData?.detail || ''
      if (errorMsg.includes('too long')) {
        errorMsg = 'The template is too long. Please shorten it.'
      }
      Toast.error(errorMsg || 'Add prompt failed, please try again later')
    },
  })
  const deletePromptLibraryCardMutation = useMutation({
    mutationFn: PromptLibraryService.deletePrivatePrompt,
    onSuccess: () => {
      Toast.success('Delete prompt success')
      queryClient.refetchQueries({
        queryKey: [PROMPT_LIBRARY_API.GET_OWN_PROMPTS],
      })
    },
    onError: async (error) => {
      const errorData = (await (error as any)?.json?.()) || {}
      const errorMsg = errorData?.detail || ''
      Toast.error(errorMsg || 'Delete prompt failed, please try again later')
    },
  })
  return {
    editPromptId: promptLibrary.editPromptId,
    isOpenPromptLibraryEditForm: promptLibrary.editPromptId !== '',
    openPromptLibraryEditForm,
    closePromptLibraryEditForm,
    addFavoritePromptMutation,
    removeFavoritePromptMutation,
    addPromptLibraryCardMutation,
    editPromptLibraryCardMutation,
    deletePromptLibraryCardMutation,
  }
}
export default usePromptActions
