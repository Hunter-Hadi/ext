import { useQuery } from '@tanstack/react-query'
import { IPromptCategoryApiData } from '@/features/prompt_library/types'
import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'
import { useMemo } from 'react'
import orderBy from 'lodash-es/orderBy'
import { list2Options } from '@/utils/dataHelper/arrayHelper'

const usePromptLibraryCategory = (selectedCategory?: string) => {
  const { isLoading, data } = useQuery<IPromptCategoryApiData[]>({
    queryKey: [PROMPT_LIBRARY_API.PROMPT_CATEGORY],
    queryFn: PromptLibraryService.getCategoryOptions,
    initialData: [
      {
        category: 'All',
        use_cases: ['All'],
      },
    ],
  })
  const categoryOptions = useMemo(() => {
    if (data) {
      return orderBy(
        list2Options(data, {
          labelKey: 'category',
          valueKey: 'category',
        }),
        (item) => item.value === 'All',
        ['desc'],
      )
    }
    return []
  }, [data])
  const useCaseOptions = useMemo(() => {
    const category = selectedCategory || 'All'
    const categoryData = categoryOptions.find((item) => item.value === category)
    if (categoryData) {
      return orderBy(
        list2Options(categoryData?.origin?.use_cases || []),
        (item) => item.value === 'All',
        ['desc'],
      )
    }
    return []
  }, [categoryOptions, selectedCategory])
  return { useCaseOptions, categoryOptions, loading: isLoading }
}
export default usePromptLibraryCategory
