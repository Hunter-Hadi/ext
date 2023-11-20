import { omit } from 'lodash-es'
import { useState } from 'react'

import { IPromptVariable } from '@/features/prompt_library/types'
import { promptActionToast as Toast } from '@/features/prompt_library/utils'
import { post } from '@/utils/request'
import { PROMPT_API } from '@/features/prompt_library/service'

export interface IAddPromptParams {
  type: boolean
  prompt_hint: string
  prompt_template: string
  prompt_title: string
  teaser: string
  category: string
  use_case: string
  variables: IPromptVariable[]

  user_input?: string
  optional_prompt_template?: string
  author?: string
  author_url?: string
}

const usePromptActions = () => {
  const [loading, setLoading] = useState(false)

  const addPrompt = async (params: IAddPromptParams) => {
    try {
      setLoading(true)
      const res = await post<{ id: string }>(PROMPT_API.ADD_PROMPT, {
        ...params,
        // prompt_hint: '_',
        type: params.type ? 'public' : 'private',
        // 请求接口前，清理下无用的字段
        variables: params.variables.map((variable) => ({
          hint: variable.hint,
          name: variable.name,
          type: variable.type,
        })),
      })

      if (res.status === 'OK' && res.data?.id) {
        Toast.success('Add prompt success')
        return res.data.id
      }
      return ''
    } catch (error: any) {
      console.error('Add prompt error', error?.response?.data)
      let errorMsg = error?.response?.data?.detail
      if (errorMsg.includes('too long')) {
        errorMsg = 'The template is too long. Please shorten it.'
      }
      Toast.error(errorMsg || 'Add prompt failed, please try again later')
      return ''
    } finally {
      setLoading(false)
    }
  }

  const clonePrompt = async (params: Partial<IAddPromptParams>) => {
    try {
      setLoading(true)
      const res = await post<{ id: string }>(PROMPT_API.ADD_PROMPT, {
        ...omit(params, 'id'),
        type: params.type ? 'public' : 'private',
      })

      if (res.status === 'OK' && res.data?.id) {
        Toast.success('Clone prompt success')
        return res.data.id
      }
      return ''
    } catch (error: any) {
      Toast.error(
        error?.response?.data?.detail ||
          'Clone prompt failed, please try again later',
      )
      console.error('Clone prompt error', error)
      return ''
    } finally {
      setLoading(false)
    }
  }
  const editPrompt = async (params: IAddPromptParams) => {
    try {
      setLoading(true)
      const res = await post<{ id: string }>(PROMPT_API.EDIT_OWN_PROMPT, {
        ...params,
        type: params.type ? 'public' : 'private',
        // 请求接口前，清理下无用的字段
        variables: params.variables.map((variable) => ({
          hint: variable.hint,
          name: variable.name,
          type: variable.type,
        })),
      })

      if (res.status === 'OK') {
        Toast.success('Edit prompt success')
        return true
      }
      return false
    } catch (error: any) {
      Toast.error(
        error?.response?.data?.detail ||
          'Edit prompt failed, please try again later',
      )
      console.error('Edit prompt error', error)
      return false
    } finally {
      setLoading(false)
    }
  }
  const deletePrompt = async (id: string) => {
    try {
      setLoading(true)
      const res = await post<{ id: string }>(PROMPT_API.DELETE_PROMPT, {
        id,
      })

      if (res.status === 'OK') {
        Toast.success('Delete prompt success')
        return true
      }
      return false
    } catch (error: any) {
      Toast.error(
        error?.response?.data?.detail ||
          'Delete prompt failed, please try again later',
      )
      console.error('Delete prompt error', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    addPrompt,
    clonePrompt,
    editPrompt,
    deletePrompt,
    loading,
  }
}
export default usePromptActions
