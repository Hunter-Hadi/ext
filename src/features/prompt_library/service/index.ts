import uniq from 'lodash-es/uniq'

import {
  IFavoritePromptListResponse,
  IOwnPromptListResponse,
  IPromptCategoryApiData,
  IPromptLibraryCardData,
  IPromptLibraryCardDetailData,
  IPromptLibraryListParametersState,
} from '@/features/prompt_library/types'
import { objectFilterEmpty } from '@/utils/dataHelper/objectHelper'
import { clientMaxAIGet, clientMaxAIPost } from '@/utils/request'

export const PROMPT_LIBRARY_API = {
  GET_FAVOURITE_PROMPTS: '/prompt/get_favourite_prompts',
  GET_OWN_PROMPTS: '/prompt/get_own_prompts',
  SEARCH_PROMPT: '/prompt/search_prompt',
  GET_PROMPT_DETAIL: '/prompt/get_prompt_detail',
  GET_PRIVATE_PROMPT_DETAIL: '/prompt/get_private_prompt_detail',
  PROMPT_CATEGORY: '/prompt/category',
  ADD_PROMPT: '/prompt/add_own_prompt',
  ADD_FAVOURITE_PROMPT: '/prompt/add_favourite_prompt',
  REMOVE_FAVOURITE_PROMPT: '/prompt/remove_favourite_prompt',
  DELETE_PROMPT: '/prompt/remove_own_prompt',
  EDIT_OWN_PROMPT: '/prompt/update_own_prompt',
}

interface PaginatedData<T> {
  data: T[]
  current_page_size: number
  total: number
  current_page: number
  msg: string
  status: string
}

export default class PromptLibraryService {
  constructor() {}

  /**
   * 获取分类列表
   */
  static async getCategoryOptions(): Promise<IPromptCategoryApiData[]> {
    const response = await clientMaxAIGet<IPromptCategoryApiData[]>(
      PROMPT_LIBRARY_API.PROMPT_CATEGORY,
    )
    if (response.status === 'OK' && response.data?.length) {
      // 因为数据库的问题，需要合并相同的category的use_case数组
      const categoryMap = new Map<string, IPromptCategoryApiData>()
      response.data.forEach((item) => {
        if (categoryMap.has(item.category)) {
          const category = categoryMap.get(item.category)
          if (category) {
            category.use_cases = uniq([
              ...category.use_cases,
              ...item.use_cases,
            ])
          }
        } else {
          categoryMap.set(item.category, item)
        }
      })
      return Array.from(categoryMap.values())
    }
    return []
  }

  /**
   * 获取公共prompt列表
   * @param params
   */
  static async getPublicPrompts(params: IPromptLibraryListParametersState) {
    const response = await clientMaxAIPost(
      PROMPT_LIBRARY_API.SEARCH_PROMPT,
      objectFilterEmpty({
        page: params.page,
        page_size: params.page_size,
        category: params.category === 'All' ? '' : params.category,
        use_case: params.use_case === 'All' ? '' : params.use_case,
        keyword: params.query,
      }),
    )
    if (response.status === 'OK') {
      return response as PaginatedData<IPromptLibraryCardData>
    }
    return undefined
  }

  /**
   * 获取Favorite prompt列表
   */
  static async getFavouritePrompts() {
    const res = await clientMaxAIPost<IFavoritePromptListResponse>(
      PROMPT_LIBRARY_API.GET_FAVOURITE_PROMPTS,
      {},
    )
    return (res.data?.favourite_prompts || []) as IPromptLibraryCardData[]
  }

  /**
   * 添加Favorite prompt
   * @param id
   */
  static async addFavoritePrompt(id: string) {
    const response = await clientMaxAIPost<{ id: string }>(
      PROMPT_LIBRARY_API.ADD_FAVOURITE_PROMPT,
      {
        id,
      },
    )
    return response.status === 'OK'
  }

  /**
   * 删除Favorite prompt
   * @param id
   */
  static async removeFavoritePrompt(id: string) {
    const res = await clientMaxAIPost<{ id: string }>(
      PROMPT_LIBRARY_API.REMOVE_FAVOURITE_PROMPT,
      {
        id,
      },
    )
    return res.status === 'OK'
  }

  /**
   * 获取自定义的prompt列表
   */
  static async getOwnPrompts() {
    const res = await clientMaxAIPost<IOwnPromptListResponse>(
      PROMPT_LIBRARY_API.GET_OWN_PROMPTS,
      {},
    )
    return (res.data?.own_prompts || []) as IPromptLibraryCardData[]
  }

  /**
   * 获取公共Prompt详情
   * @param id
   */
  static async getPublicPromptDetail(id: string) {
    const result = await clientMaxAIPost<IPromptLibraryCardDetailData>(
      PROMPT_LIBRARY_API.GET_PROMPT_DETAIL,
      {
        id,
      },
    )
    return result.data
  }

  /**
   * 获取私有Prompt详情
   * @param id
   */
  static async getPrivatePromptDetail(id: string) {
    const result = await clientMaxAIPost<IPromptLibraryCardDetailData>(
      PROMPT_LIBRARY_API.GET_PRIVATE_PROMPT_DETAIL,
      {
        id,
      },
    )
    return result.data
  }
  /**
   * 添加私有Prompt
   * @param promptData
   */
  static async addPrivatePrompt(promptData: IPromptLibraryCardDetailData) {
    const result = await clientMaxAIPost<{ id: string }>(
      PROMPT_LIBRARY_API.ADD_PROMPT,
      {
        ...promptData,
        prompt_hint: '_',
        id: '',
      },
    )
    return result.data
  }
  /**
   * 编辑私有Prompt
   * @param promptData
   */
  static async editPrivatePrompt(promptData: IPromptLibraryCardDetailData) {
    const result = await clientMaxAIPost<{ id: string }>(
      PROMPT_LIBRARY_API.EDIT_OWN_PROMPT,
      {
        ...promptData,
        prompt_hint: promptData.prompt_hint || '_',
      },
    )
    return result.data
  }

  /**
   * 删除私有Prompt
   * @param id
   */
  static async deletePrivatePrompt(id: string) {
    const result = await clientMaxAIPost<{ id: string }>(
      PROMPT_LIBRARY_API.DELETE_PROMPT,
      {
        id,
      },
    )
    return result.status === 'OK'
  }
}
