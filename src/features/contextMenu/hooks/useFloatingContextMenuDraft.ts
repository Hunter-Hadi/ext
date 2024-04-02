import { useMemo, useState } from 'react'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IChatMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
/**
 * AI持续生成的草稿
 */
const useFloatingContextMenuDraft = () => {
  const [page, setPage] = useState(1)
  const { clientWritingMessage, clientConversationMessages } =
    useClientConversation()
  const aiMessages: IChatMessage[] = []
  const memoAIMessages = useMemo(() => {
    return clientConversationMessages.filter((message) => isAIMessage(message))
  }, [clientConversationMessages])
  return useMemo(() => {}, [clientWritingMessage, aiMessages])
}
export default useFloatingContextMenuDraft
