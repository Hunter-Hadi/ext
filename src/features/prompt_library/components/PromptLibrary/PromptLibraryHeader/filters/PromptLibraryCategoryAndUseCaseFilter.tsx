import React, { FC, useMemo } from 'react'
import { BaseSelect } from '@/components/select'
import usePromptLibraryParameters from '@/features/prompt_library/hooks/usePromptLibraryParameters'
import PromptLibraryService, {
  PROMPT_LIBRARY_API,
} from '@/features/prompt_library/service'
import { IPromptCategoryApiData } from '@/features/prompt_library/types'
import { useQuery } from '@tanstack/react-query'
import { list2Options } from '@/utils/dataHelper/arrayHelper'
import orderBy from 'lodash-es/orderBy'

const PromptLibraryCategoryAndUseCaseFilter: FC = () => {
  const {
    promptLibraryListParametersState,
    updatePromptLibraryListParameters,
  } = usePromptLibraryParameters()
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
  const memoCategoryOptions = useMemo(() => {
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
  const memoUseCaseOptions = useMemo(() => {
    const category = promptLibraryListParametersState.category
    const categoryData = memoCategoryOptions.find(
      (item) => item.value === category,
    )
    if (categoryData) {
      return orderBy(
        list2Options(categoryData?.origin?.use_cases || []),
        (item) => item.value === 'All',
        ['desc'],
      )
    }
    return []
  }, [memoCategoryOptions, promptLibraryListParametersState.category])
  return (
    <>
      <BaseSelect
        loading={isLoading}
        sx={{ height: 44 }}
        label={'Category'}
        options={memoCategoryOptions}
        value={promptLibraryListParametersState.category}
        MenuProps={{
          sx: {
            maxHeight: '550px',
          },
        }}
        onChange={async (value: any, option: any) => {
          updatePromptLibraryListParameters({
            category: value as string,
            use_case: 'All',
          })
        }}
      />
      <BaseSelect
        sx={{ height: 44 }}
        label={'Use case'}
        options={memoUseCaseOptions}
        value={promptLibraryListParametersState.use_case}
        MenuProps={{
          sx: {
            maxHeight: '550px',
          },
        }}
        onChange={async (value, option) => {
          updatePromptLibraryListParameters({
            use_case: value as string,
          })
        }}
      />
    </>
  )
}
export default PromptLibraryCategoryAndUseCaseFilter
