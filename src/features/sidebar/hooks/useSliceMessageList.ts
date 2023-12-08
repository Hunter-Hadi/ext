import { throttle } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { IChatMessage } from '@/features/chatgpt/types'
import { getMaxAISidebarRootElement } from '@/features/common/utils'

interface ISliceMessageOptions {
  // 每页大小
  pageSize: number
  // 监听列表第几个元素
  buffer: number
}

const useSliceMessageList = (
  scrollElementId: string,
  messageListElementId: string,
  list: IChatMessage[],
  coverOptions?: ISliceMessageOptions,
) => {
  const [loaded, setLoaded] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)

  const currentObserverTarget = useRef<Element | null>(null)
  // 记录 pageNum 变化前的 scrollHeight
  const originalScrollHeight = useRef(0)
  const scrollTop = useRef(0)

  const [pageNum, setPageNum] = useState(1)
  const [pageSize] = useState(coverOptions?.buffer || 10)
  const total = useMemo(() => list.length, [list])

  const buffer = coverOptions?.buffer || 0

  const getMessageListElement = () => {
    const root = getMaxAISidebarRootElement()
    return root?.querySelector<HTMLElement>(`#${messageListElementId}`)
  }

  const getScrollContainerElement = () => {
    const root = getMaxAISidebarRootElement()
    return root?.querySelector<HTMLElement>(`#${scrollElementId}`)
  }

  const checkContainerListIsLoaded = useCallback(async () => {
    return new Promise((resolve) => {
      // 轮询 containerList
      const pollingContainerList = () => {
        let timer: number | null = null
        if (timer) {
          window.clearTimeout(timer)
        }
        const scrollContainer = getScrollContainerElement()
        const messageListContainer = getMessageListElement()
        if (scrollContainer && messageListContainer) {
          resolve(true)
          return
        }
        timer = window.setTimeout(() => {
          pollingContainerList()
        }, 200)
      }
      pollingContainerList()
    })
  }, [])

  useEffect(() => {
    // 检查 containerList 是否已经加载
    checkContainerListIsLoaded().then(() => {
      // 由于 容器在加载 message list 时滚动条会在顶部，所以需要延迟等待，容器自动滚动到底部时才开始监听
      setTimeout(() => {
        setLoaded(true)
      }, 1000)
    })
  }, [])

  const loadMore = useCallback(() => {
    setPageNum((prePageNum) => {
      if (prePageNum * pageSize >= total) {
        return prePageNum
      }
      return prePageNum + 1
    })
  }, [total, pageSize])

  const loadMoreRef = useRef(loadMore)
  useEffect(() => (loadMoreRef.current = throttle(loadMore, 1000)), [loadMore])

  const startMonitor = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect()
    }

    const messageListContainer = getMessageListElement()

    if (messageListContainer) {
      let timer: number | null = null
      const tryObserve = () => {
        if (timer) {
          window.clearTimeout(timer)
        }
        const target = messageListContainer.children[buffer]
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

  const refreshMonitorTarget = useCallback(() => {
    const messageListContainer = getMessageListElement()

    if (observer.current && messageListContainer) {
      if (currentObserverTarget.current) {
        observer.current.unobserve(currentObserverTarget.current)
      }

      const target = messageListContainer.children[buffer]
      if (target) {
        currentObserverTarget.current = target
        observer.current.observe(target)
      }
    }
  }, [buffer])

  const slicedMessageList = useMemo(() => {
    if (pageSize === -1) return list
    return list.slice(-(pageNum * pageSize))
  }, [list, pageNum, pageSize])

  useEffect(() => {
    // 当 slicedMessageList 变化时需要重新挂载 observe 的监听节点
    refreshMonitorTarget()
  }, [refreshMonitorTarget, slicedMessageList])

  useEffect(() => {
    if (loaded && list.length > pageSize) {
      startMonitor()
    }

    return () => {
      observer.current && observer.current.disconnect()
    }
  }, [loaded, startMonitor, list, pageSize])

  useEffect(() => {
    if (!loaded || list.length <= pageSize) {
      return
    }

    const scrollContainer = getScrollContainerElement()
    const recordScrollInfo = () => {
      scrollTop.current = scrollContainer?.scrollTop || 0
      originalScrollHeight.current = scrollContainer?.scrollHeight || 0
    }

    // 由于这里在频繁滚动的过程中，也需要及时更新 scroll info， 所以使用 throttle 而不是 debounce
    const debounceRecordScrollInfo = throttle(recordScrollInfo, 200)

    scrollContainer?.addEventListener('scroll', debounceRecordScrollInfo)

    return () => {
      scrollContainer?.removeEventListener('scroll', debounceRecordScrollInfo)
    }
  }, [loaded, list])

  useEffect(() => {
    setPageNum(1)
  }, [total])

  useEffect(() => {
    if (!loaded) {
      return
    }
    // 当 slicedMessageList 变化时，代表滚动加载了
    // 需要把滚动位置移动到 lastTimeObserverTarget.current 的位置
    const scrollContainer = getScrollContainerElement()
    if (scrollContainer && scrollTop.current > 0) {
      const currentScrollHeight = scrollContainer?.scrollHeight
      scrollContainer.scrollTop =
        scrollTop.current + currentScrollHeight - originalScrollHeight.current
    }
  }, [loaded, slicedMessageList])

  return {
    slicedMessageList,
    loadMore,
    changePageNumber: useCallback((page: number) => setPageNum(page), []),
  }
}

export default useSliceMessageList
