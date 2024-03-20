import { useEffect, useState } from 'react'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'

/**
 * 因为action之间的loading切换比较频繁，可能导致ui闪烁，所以这里封装了一个平滑的loading状态
 * @param smoothInterval
 * @since 2023-10-24
 */
const useSmoothConversationLoading = (smoothInterval = 200) => {
  const { clientWritingMessage } = useClientConversation()
  const [smoothConversationLoading, setSmoothConversationLoading] =
    useState(false)
  useEffect(() => {
    let timer: null | ReturnType<typeof setTimeout> = null
    if (clientWritingMessage.loading) {
      console.log('debouncedLoadingState', true)
      setSmoothConversationLoading(true)
    } else {
      timer = setTimeout(() => {
        console.log('debouncedLoadingState', false)
        setSmoothConversationLoading(false)
      }, smoothInterval)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [clientWritingMessage.loading, smoothInterval])
  return { smoothConversationLoading }
}
export default useSmoothConversationLoading
