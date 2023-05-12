import { IChatMessage } from '@/features/chatgpt/types'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

interface ISliceMessageOptions {
  // 每页大小
  pageSize: number
  // 监听列表第几个元素
  buffer: number
}

const useSliceMessageList = (
  containerList: HTMLElement | null,
  list: IChatMessage[],
  coverOptions?: ISliceMessageOptions,
) => {
  const observer = useRef<IntersectionObserver | null>(null)
  const currentObserverTarget = useRef<Element | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(coverOptions?.buffer || 10)
  const buffer = coverOptions?.buffer || 0

  const startMonitor = useCallback(() => {
    // debugger
    if (observer.current) {
      observer.current.disconnect()
    }
    if (containerList) {
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
      }
    }
  }, [containerList])

  const refreshMonitor = useCallback(() => {
    if (observer.current && containerList) {
      if (currentObserverTarget.current) {
        observer.current.unobserve(currentObserverTarget.current)
      }

      const target = containerList.children[buffer]
      if (target) {
        observer.current.observe(target)
      }
    }
  }, [containerList, buffer])

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

  useLayoutEffect(() => {
    if (list.length > pageSize) {
      startMonitor()
    }
    return () => {
      observer.current && observer.current.disconnect()
    }
  }, [startMonitor, list, pageSize])

  return {
    slicedMessageList,
    loadMore,
    changePageNumber: useCallback((page: number) => setPageNum(page), []),
  }
}

export default useSliceMessageList
