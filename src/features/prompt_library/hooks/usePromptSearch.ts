import { useEffect, useMemo, useState } from 'react'
import { useRecoilValue } from 'recoil'

import { PromptSearchParamsStore } from '@/features/prompt_library/store'
import {
  IFavoritesPromptListRespeonse,
  IPromptCardData,
} from '@/features/prompt_library/types'
import { objectFilterEmpty } from '@/utils/dataHelper/objectHelper'
import { post } from '@/utils/request'
import usePaginatedQuery from '@/features/prompt_library/hooks/usePaginatedQuery'
import { handleVariableTypeWithInputVariable } from '@/features/prompt_library/utils'
import { PROMPT_API } from '@/features/prompt_library/service'

const defaultPageSize = 12

interface PaginatedData<T> {
  data: T[]
  current_page_size: number
  total: number
  current_page: number
  msg: string
  status: string
}

const usePromptSearch = () => {
  const searchParams = useRecoilValue(PromptSearchParamsStore)
  const category = searchParams.category || ''
  const use_case = searchParams.use_case || ''
  const keyword = searchParams.keyword || ''
  const tabActive = searchParams.tab_active || ''
  const pageSize = Number(defaultPageSize)

  const [listApiUrl, setListApiUrl] = useState(PROMPT_API.SEARCH_PROMPT)

  useEffect(() => {
    let listurl = PROMPT_API.SEARCH_PROMPT
    if (tabActive === 'Favorites') {
      listurl = PROMPT_API.GET_FAVOURITE_PROMPTS
    }
    if (tabActive === 'Own') {
      listurl = PROMPT_API.GET_OWN_PROMPTS
    }
    if (tabActive === 'Public') {
      listurl = PROMPT_API.SEARCH_PROMPT
    }
    setListApiUrl(listurl)
    setPageSize(defaultPageSize)
    setCurrent(0)
  }, [tabActive])

  useEffect(() => {
    setCurrent(0)
  }, [keyword])

  const {
    setCurrent,
    setPageSize,
    data,
    isFetching,
    ...PaginatedQueryRest
  } = usePaginatedQuery(
    [listApiUrl, category, use_case, keyword, pageSize],
    async (page, page_size) => {
      let postCategory = category ? decodeURIComponent(category) : ''
      let postUseCase = use_case ? decodeURIComponent(use_case) : ''
      if (postCategory === 'All') {
        postCategory = ''
      }
      if (postUseCase === 'All') {
        postUseCase = ''
      }
      // 由于 tabActive === ‘Public’ 时返回的结构不一样所以需要特殊处理
      if (tabActive === 'Public') {
        const result = (await post(
          listApiUrl,
          objectFilterEmpty({
            page,
            page_size,
            category: postCategory,
            use_case: postUseCase,
            keyword,
          }),
        )) as PaginatedData<IPromptCardData>
        return result
      }
      const {
        data: response,
        status,
        msg,
      } = await post<IFavoritesPromptListRespeonse>(
        listApiUrl,
        objectFilterEmpty({
          page_number: page,
          // own 和 favvorite 的 page_size 先传 20 获取全部
          page_size: 20,
          category: postCategory,
          use_case: postUseCase,
          keyword,
        }),
      )

      return {
        data:
          tabActive === 'Own'
            ? response?.own_prompts || []
            : response?.favourite_prompts || [],
        current_page_size: response?.page_size,
        total: response?.total_prompts_cnt,
        current_page: response?.page_number,
        msg,
        status,
      }
    },
    {
      pageSize,
    },
  )

  const formatData = useMemo(() => {
    return data.map((item) => {
      let variables = item.variables
      if (variables && item.variable_types) {
        variables = handleVariableTypeWithInputVariable(
          variables,
          item.variable_types,
        )
      }
      return {
        ...item,
        variables,
      }
    })
  }, [data])

  return {
    data: formatData,
    isFetching,
    setCurrent,
    setPageSize,
    ...PaginatedQueryRest,
  }
}
export default usePromptSearch
