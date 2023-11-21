import uniqBy from 'lodash-es/uniqBy'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { useRecoilState } from 'recoil'

import { IOptionType } from '@/components/select/BaseSelect'
import {
  PrompstCategoryOptions,
  PromptSearchParamsStore,
} from '@/features/prompt_library/store'
import {
  IPromptCategoryApiData,
  IPromptListType,
} from '@/features/prompt_library/types'
import { PROMPT_LIBRARY_API } from '@/features/prompt_library/service'
import { list2Options } from '@/utils/dataHelper/arrayHelper'
import { get } from '@/utils/request'

interface IUsePromptCategoriesProps {
  enableSearchParams?: boolean
  defaultCategory?: string
  autoQuery?: boolean
}

const usePromptCategories = (props?: IUsePromptCategoriesProps) => {
  const { enableSearchParams = false, defaultCategory, autoQuery = true } =
    props || {}
  const [searchParamsStore, setSearchParamsStore] = useRecoilState(
    PromptSearchParamsStore,
  )
  const [categoryOptions, setCategoryOptions] = useRecoilState(
    PrompstCategoryOptions,
  )
  const [useCaseOptions, setUseCaseOptions] = useState<IOptionType[]>([])

  const [loaded, setLoaded] = useState<boolean>(false)
  const tabActive = searchParamsStore.tab_active
  const setTabActive = (tabActive: IPromptListType) => {
    setSearchParamsStore((preValue) => ({
      ...preValue,
      tab_active: tabActive,
    }))
  }
  const [currentCategory, setCurrentCategory] = useState<IOptionType | null>(
    null,
  )
  const [currentUseCase, setCurrentUseCase] = useState<IOptionType | null>(null)

  const [searchKeyword, setSearchKeyword] = useState<string | null>(null)

  const { isFetching, data } = useQuery(
    [PROMPT_LIBRARY_API.PROMPT_CATEGORY],
    () =>
      get<{
        status: string
        data: IPromptCategoryApiData[]
        msg: string
      }>(PROMPT_LIBRARY_API.PROMPT_CATEGORY),
    {
      enabled: autoQuery,
      refetchOnWindowFocus: false,
    },
  )
  const setCategoryAndUseCase = (
    category: IOptionType,
    useCaseValue?: string,
  ) => {
    setCurrentCategory(category)
    const newUseCaseOptions = [
      {
        label: 'All',
        value: 'All',
      },
    ].concat(list2Options(category?.origin?.use_cases || []))
    setUseCaseOptions(uniqBy(newUseCaseOptions, 'value'))
    let useCaseOption: IOptionType = newUseCaseOptions[0]
    if (useCaseValue) {
      const findUseCaseOption = newUseCaseOptions.find(
        (item) => item.value === useCaseValue,
      )
      if (findUseCaseOption) {
        useCaseOption = findUseCaseOption
      }
    }
    setCurrentUseCase(useCaseOption)
  }
  useEffect(() => {
    if (!loaded) {
      if (!isFetching && data?.data) {
        const newCategoryOptions = list2Options(data.data, {
          labelKey: 'category',
          valueKey: 'category',
        })
        setCategoryOptions(uniqBy(newCategoryOptions, 'value'))
        if (defaultCategory && newCategoryOptions.length > 0) {
          const findCategoryOption = newCategoryOptions.find(
            (item) => item.value === defaultCategory,
          )
          if (findCategoryOption) {
            setCategoryAndUseCase(findCategoryOption)
          }
        } else {
          setCategoryAndUseCase(newCategoryOptions[0])
        }
        setLoaded(true)
      }
    }
  }, [isFetching, data, loaded, defaultCategory])

  useEffect(() => {
    if (loaded) {
      const useCaseOptions = [
        {
          label: 'All',
          value: 'All',
        },
      ].concat(list2Options(currentCategory?.origin?.use_cases || []))
      setUseCaseOptions(uniqBy(useCaseOptions, 'value'))
      setCurrentUseCase(useCaseOptions[0])
    }
  }, [loaded, currentCategory])

  useEffect(() => {
    if (loaded && enableSearchParams) {
      setSearchParamsStore((preValue) => ({
        ...preValue,
        category: (currentCategory?.value || '') as string,
        use_case: (currentUseCase?.value || '') as string,
        keyword: searchKeyword || '',
        tab_active: tabActive,
      }))
    }
  }, [
    loaded,
    enableSearchParams,
    tabActive,
    currentCategory,
    currentUseCase,
    searchKeyword,
  ])

  return {
    loaded,
    categoryOptions,
    useCaseOptions,
    currentCategory,
    currentUseCase,
    searchKeyword,
    tabActive,
    setTabActive,
    setSearchKeyword,
    setCurrentCategory,
    setCurrentUseCase,
  }
}
export { usePromptCategories }
