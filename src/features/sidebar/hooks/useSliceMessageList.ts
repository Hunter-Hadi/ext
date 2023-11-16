import { IChatMessage } from '@/features/chatgpt/types'
import { getAppRootElement } from '@/utils'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface ISliceMessageOptions {
  // 每页大小
  pageSize: number
  // 监听列表第几个元素
  buffer: number
}

const useSliceMessageList = (
  containerListId: string,
  list: IChatMessage[],
  coverOptions?: ISliceMessageOptions,
) => {
  const [loaded, setLoaded] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const currentObserverTarget = useRef<Element | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(coverOptions?.buffer || 10)
  const buffer = coverOptions?.buffer || 0

  const total = useMemo(() => list.length, [list])

  const loadMore = useCallback(() => {
    setPageNum((prePageNum) => {
      if (prePageNum * pageSize >= total) {
        return prePageNum
      }
      return prePageNum + 1
    })
  }, [total, pageSize])

  const loadMoreRef = useRef(loadMore)
  useEffect(() => (loadMoreRef.current = loadMore), [loadMore])
  const startMonitor = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect()
    }

    const root = getAppRootElement()
    const containerList = root?.querySelector(`#${containerListId}`)

    if (containerList) {
      let timer: number | null = null
      const tryObserve = () => {
        if (timer) {
          window.clearTimeout(timer)
        }
        const target = containerList.children[buffer]
        if (target) {
          const observerCallback = (entries: IntersectionObserverEntry[]) => {
            // 因为只监听某个item 所以只有一个
            const monitorEl = entries[0]
            if (monitorEl.isIntersecting) {
              console.log('trigger loadMore', target)
              loadMoreRef.current()
            }
          }
          observer.current = new IntersectionObserver(observerCallback)
          currentObserverTarget.current = target
          observer.current.observe(target)
        } else {
          timer = window.setTimeout(() => {
            tryObserve()
          }, 1000)
        }
      }

      tryObserve()
    }
  }, [buffer])

  const refreshMonitor = useCallback(() => {
    const root = getAppRootElement()
    const containerList = root?.querySelector(`#${containerListId}`)

    if (observer.current && containerList) {
      if (currentObserverTarget.current) {
        observer.current.unobserve(currentObserverTarget.current)
      }

      const target = containerList.children[buffer]
      if (target) {
        observer.current.observe(target)
      }
    }
  }, [containerListId, buffer])

  const slicedMessageList = useMemo(() => {
    if (pageSize === -1) return list
    return list.slice(-(pageNum * pageSize))
  }, [list, pageNum, pageSize])

  const checkContainerListIsLoaded = useCallback(async () => {
    return new Promise((resolve) => {
      // 轮询 containerList
      const pollingContainerList = () => {
        let timer: number | null = null
        if (timer) {
          window.clearTimeout(timer)
        }
        const root = getAppRootElement()
        const containerList = root?.querySelector(`#${containerListId}`)
        if (!containerList) {
          timer = window.setTimeout(() => {
            pollingContainerList()
          }, 200)
          return
        } else {
          resolve(true)
        }
      }
      pollingContainerList()
    })
  }, [containerListId])

  useEffect(() => {
    // 当 slicedMessageList 变化时需要重新挂载 observe 的监听节点
    refreshMonitor()
  }, [refreshMonitor, slicedMessageList])

  useEffect(() => {
    const root = getAppRootElement()
    const containerList = root?.querySelector(`#${containerListId}`)
    if (loaded && containerList && list.length > pageSize) {
      startMonitor()
    }

    return () => {
      observer.current && observer.current.disconnect()
    }
  }, [loaded, startMonitor, list, pageSize, containerListId])

  useEffect(() => {
    checkContainerListIsLoaded().then(() => {
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    setPageNum(1)
  }, [total])

  return {
    slicedMessageList,
    loadMore,
    changePageNumber: useCallback((page: number) => setPageNum(page), []),
  }
}

export default useSliceMessageList
