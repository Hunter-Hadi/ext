import { debounce, throttle } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useRecoilState } from 'recoil'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import usePaginationConversationMessages from '@/features/chatgpt/hooks/usePaginationConversationMessages'

import { SidebarPageState } from '../store'

interface ISliceMessageOptions {
  // 监听列表第几个元素（从上往下数）
  buffer?: number

  pageSize?: number
}

const useMessageListPaginator = (
  ready: boolean,
  scrollContainerRef: React.RefObject<HTMLElement>,
  coverOptions?: ISliceMessageOptions,
) => {
  const {
    // 经过测试 buffer 为 0 时，滚动翻页的效果最好
    buffer = 0,
    pageSize = 10,
  } = coverOptions || {}

  const observer = useRef<IntersectionObserver | null>(null)

  const currentObserverTarget = useRef<Element | null>(null)
  // 记录 pageNum 变化前的 scrollHeight
  const originalScrollHeight = useRef(0)
  const scrollTop = useRef(0)

  const { currentConversationId } = useClientConversation()
  const {
    pageNum,
    isLoading,
    messages,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = usePaginationConversationMessages(currentConversationId || '')

  const [sidebarPageState, setSidebarPageState] =
    useRecoilState(SidebarPageState)
  const { messageListPageNum: showPageNum } = sidebarPageState
  const setPageNum = useCallback(
    (pageOrPageSetter: number | ((preState: number) => number)) => {
      setSidebarPageState((preState) => {
        const page =
          typeof pageOrPageSetter === 'function'
            ? pageOrPageSetter(preState.messageListPageNum)
            : pageOrPageSetter

        return {
          ...preState,
          messageListPageNum: page,
        }
      })
    },
    [],
  )

  const getScrollContainerElement = () => {
    return scrollContainerRef?.current
  }

  const getMessageListItems = () => {
    const scrollContainer = getScrollContainerElement()
    if (scrollContainer) {
      const messageListItems = scrollContainer.querySelectorAll<HTMLElement>(
        '.use-chat-gpt-ai__message-item',
      )

      return Array.from(messageListItems)
    }

    return []
  }

  const loadMore = useCallback(() => {
    if (
      !ready ||
      isFetchingNextPage ||
      !hasNextPage ||
      !currentConversationId
    ) {
      return
    }
    fetchNextPage()
  }, [
    ready,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    currentConversationId,
  ])
  useEffect(() => {
    setPageNum(pageNum)
  }, [pageNum])
  const loadMoreRef = useRef(loadMore)
  useEffect(() => {
    loadMoreRef.current = debounce(loadMore, 100)
  }, [loadMore])

  const startMonitor = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect()
    }

    const messageListItems = getMessageListItems()
    if (messageListItems) {
      let timer: number | null = null
      const tryObserve = () => {
        if (timer) {
          window.clearTimeout(timer)
        }

        const target = messageListItems[buffer]
        if (target) {
          const observerCallback = (entries: IntersectionObserverEntry[]) => {
            // 因为只监听某个item 所以只有一个
            const monitorEl = entries[0]
            if (monitorEl.isIntersecting) {
              console.log(' trigger loadMore', target)
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
    const messageListItems = getMessageListItems()

    if (observer.current && messageListItems) {
      if (currentObserverTarget.current) {
        observer.current.unobserve(currentObserverTarget.current)
      }

      const target = messageListItems[buffer]
      if (target) {
        currentObserverTarget.current = target
        observer.current.observe(target)
      }
    }
  }, [buffer])

  const slicedMessageList = useMemo(() => {
    console.log(
      `ConversationDB[V3][对话消息列表] slicedMessageList[${showPageNum}]`,
      messages,
    )
    if (pageSize === -1) return messages
    return messages.slice(-(showPageNum * pageSize))
  }, [messages, showPageNum, pageSize])

  useEffect(() => {
    // 当 slicedMessageList 变化时需要重新挂载 observe 的监听节点
    refreshMonitorTarget()
  }, [refreshMonitorTarget, slicedMessageList])

  useEffect(() => {
    if (ready && hasNextPage) {
      startMonitor()
    }

    return () => {
      observer.current && observer.current.disconnect()
    }
  }, [ready, startMonitor, messages, hasNextPage])

  useEffect(() => {
    if (!ready || !hasNextPage) {
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
  }, [ready, messages.length, hasNextPage])

  useEffect(() => {
    if (!ready) {
      return
    }
    // 当 pageNum 变化时，代表滚动加载了
    // 需要把滚动位置移动到 lastTimeObserverTarget.current 的位置
    const scrollContainer = getScrollContainerElement()
    if (scrollContainer && scrollTop.current >= 0) {
      const currentScrollHeight = scrollContainer?.scrollHeight
      scrollContainer.scrollTop =
        scrollTop.current + currentScrollHeight - originalScrollHeight.current
    }
  }, [ready, showPageNum])

  return {
    isLoading,
    isFetchingNextPage,
    messages,
    pageNum: sidebarPageState.messageListPageNum,
    slicedMessageList,
    loadMore,
    changePageNumber: useCallback((page: number) => setPageNum(page), []),
  }
}

export default useMessageListPaginator
