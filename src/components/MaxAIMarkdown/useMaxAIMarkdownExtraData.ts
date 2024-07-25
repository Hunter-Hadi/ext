import { useContext, useMemo } from 'react'

import { MaxAIMarkdownContext } from '@/components/MaxAIMarkdown/context'
import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'

/**
 * 为了防止component重新渲染，这里提供给所有的MaxAIMarkdown组件使用的数据
 */
export const useMaxAIMarkdownExtraData = () => {
  const context = useContext(MaxAIMarkdownContext)
  const message = context.message
  const conversationId = message?.conversationId
  const originalMessage = message?.originalMessage || {}
  const { metadata = {} } = originalMessage
  const isComplete = Object.prototype.hasOwnProperty.call(
    metadata,
    'isComplete',
  )
    ? (metadata.isComplete as boolean)
    : true
  // 这里先处理一下，后端有可能返回的数据里在原文内匹配不上，缺少一些符号，目前只针对PDF显示
  // TODO youtube/email的citation需要额外逻辑处理，这一版先过滤
  const citations = useMemo(() => {
    const summaryType = getPageSummaryType()
    if (
      summaryType === 'YOUTUBE_VIDEO_SUMMARY' ||
      summaryType === 'DEFAULT_EMAIL_SUMMARY'
    ) {
      return []
    }
    return metadata?.sourceCitations?.filter((item) => {
      if (typeof item.start_index === 'number') {
        return item.start_index > -1
      }
      return true
    })
  }, [metadata?.sourceCitations])
  // 引用的链接增强展示用的数据
  const sourceLinks = message?.originalMessage?.metadata?.sources?.links || []
  return {
    conversationId,
    message,
    citations,
    sourceLinks,
    isComplete,
  }
}
