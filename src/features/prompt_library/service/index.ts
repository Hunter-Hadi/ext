import { get } from '@/utils/request'
import { IPromptCategoryApiData } from '@/features/prompt_library/types'
import uniq from 'lodash-es/uniq'

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

export default class PromptLibraryService {
  constructor() {}

  /**
   * 获取分类列表
   */
  static async getCategoryOptions(): Promise<IPromptCategoryApiData[]> {
    const response = await get<IPromptCategoryApiData[]>(
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
}
