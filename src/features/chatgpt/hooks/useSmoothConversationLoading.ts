import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import { useEffect, useState } from 'react'

/**
 * 因为action之间的loading切换比较频繁，可能导致ui闪烁，所以这里封装了一个平滑的loading状态
 * @param smoothInterval
 * @since 2023-10-24
 */
const useSmoothConversationLoading = (smoothInterval = 200) => {
  const conversationState = useRecoilValue(ChatGPTConversationState)
  const [smoothConversationLoading, setSmoothConversationLoading] = useState(
    conversationState.loading,
  )
  useEffect(() => {
    let timer: null | ReturnType<typeof setTimeout> = null
    if (!conversationState.loading) {
      timer = setTimeout(() => {
        console.log('debouncedLoadingState', false)
        setSmoothConversationLoading(false)
      }, smoothInterval)
    }
    console.log('debouncedLoadingState', true)
    setSmoothConversationLoading(true)
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [conversationState.loading, smoothInterval])
  return { smoothConversationLoading }
}
export default useSmoothConversationLoading
