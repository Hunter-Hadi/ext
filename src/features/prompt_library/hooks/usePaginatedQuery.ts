import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'

import useEffectOnce from '@/hooks/useEffectOnce'

export interface PaginatedData<T> {
  data: T[]
  current_page_size: number
  total: number
  current_page: number
  msg: string
  status: string
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export interface PaginatedQueryResult<T> {
  loaded: boolean
  current: number
  setCurrent: (current: number) => void
  pageSize: number
  setPageSize: (pageSize: number) => void
  hasNextPage: boolean
  hasPrevPage: boolean
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  data: T[]
  total: number
  refetch: () => void
}

const usePaginatedQuery = <T>(
  queryKey: (string | number)[],
  fetchFunction: (
    current: number,
    pageSize: number,
  ) => Promise<PaginatedData<T>>,
  defaultSettings?: {
    pageSize?: number
    current?: number
  },
): PaginatedQueryResult<T> => {
  const [loaded, setLoaded] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [current, setCurrent] = useState(defaultSettings?.current ?? 0)
  const [pageSize, setPageSize] = useState(defaultSettings?.pageSize ?? 10)
  const [total, setTotal] = useState(0)

  useEffectOnce(() => {
    setLoaded(true)
    setEnabled(true)
  })

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery<
    PaginatedData<T>,
    unknown
  >(
    [...queryKey, current, pageSize],
    async () => {
      return await fetchFunction(current, pageSize)
    },
    {
      enabled,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  )
  const hasNextPage = current + 1 < Math.ceil(total / pageSize)
  const hasPrevPage = current > 0

  useEffect(() => {
    if (!isFetching && !isLoading && !isError && data) {
      if (data.data.length === 0 && current > 0) {
        setCurrent(0)
      }
    }
  }, [current, data, isFetching, isLoading, isError])

  useEffect(() => {
    if (!isFetching && data) {
      setTotal(data.total)
    }
  }, [data, isFetching])

  return {
    loaded,
    current,
    setCurrent,
    pageSize,
    setPageSize,
    hasNextPage,
    data: data?.data ?? [],
    isLoading,
    isError,
    error,
    isFetching,
    hasPrevPage,
    total,
    refetch,
  }
}

export default usePaginatedQuery
