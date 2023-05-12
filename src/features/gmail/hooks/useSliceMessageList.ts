import { IChatMessage } from '@/features/chatgpt/types'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface ISliceMessageOptions {
  // 每页大小
  pageSize: number
  // 监听列表第几个元素
  buffer: number
}

const useSliceMessageList = (
  containerListRef: React.MutableRefObject<HTMLElement | null>,
  list: IChatMessage[],
  coverOptions?: ISliceMessageOptions,
) => {
  const observer = useRef<IntersectionObserver | null>(null)
  const currentObserverTarget = useRef<Element | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(coverOptions?.buffer || 10)
  const buffer = coverOptions?.buffer || 0

  const startMonitor = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect()
    }
    if (containerListRef.current) {
      const containerList = containerListRef.current
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
              loadMore()
            }
          }
          observer.current = new IntersectionObserver(observerCallback)
          console.log('start observe', target)
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
    const containerList = containerListRef.current
    if (observer.current && containerList) {
      if (currentObserverTarget.current) {
        observer.current.unobserve(currentObserverTarget.current)
      }

      const target = containerList.children[buffer]
      if (target) {
        observer.current.observe(target)
      }
    }
  }, [containerListRef, buffer])

  const loadMore = useCallback(() => {
    setPageNum((pre) => ++pre)
  }, [])

  const slicedMessageList = useMemo(() => {
    if (pageSize === -1) return list
    return list.slice(-(pageNum * pageSize))
  }, [list, pageNum, pageSize])

  useEffect(() => {
    refreshMonitor()
  }, [slicedMessageList])

  useEffect(() => {
    if (list.length > pageSize && containerListRef.current) {
      startMonitor()
    }
    return () => {
      observer.current && observer.current.disconnect()
    }
  }, [startMonitor, list, pageSize, containerListRef])

  return {
    slicedMessageList,
    loadMore,
    changePageNumber: useCallback((page: number) => setPageNum(page), []),
  }
}

export default useSliceMessageList
