import { useEffect, useMemo, useState } from 'react'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
/**
 * AI持续生成的草稿和用户选择的答案
 * @description - 因为AI的regenerate会删除消息，所以需要一个历史消息记录去让用户选择需要的AI response
 */
const useFloatingContextMenuDraft = () => {
  const [historyMessages, setHistoryMessages] = useState<IAIResponseMessage[]>(
    [],
  )
  const [activeMessageIndex, setActiveMessageIndex] = useState(0)
  const goToNextMessage = () => {
    setActiveMessageIndex((prev) => {
      return prev + 1
    })
  }
  const goToPreviousMessage = () => {
    setActiveMessageIndex((prev) => {
      return prev - 1
    })
  }

  const resetFloatingContextMenuDraft = () => {
    setHistoryMessages([])
    setActiveMessageIndex(0)
  }
  const { clientWritingMessage, clientConversationMessages } =
    useClientConversation()

  const currentFloatingContextMenuDraft = useMemo(() => {
    const activeMessage = historyMessages[activeMessageIndex]
    let draft = ''
    if (activeMessage) {
      draft = activeMessage.text
    }
    if (clientWritingMessage.writingMessage?.text) {
      draft = draft + '\n\n' + clientWritingMessage.writingMessage.text
    }
    return draft.replace(/\n{2,}/, '\n\n')
  }, [clientWritingMessage.writingMessage, historyMessages])

  useEffect(() => {
    const newMessages = clientConversationMessages.filter(isAIMessage)
    const historyMessageKeys = historyMessages.map(
      (historyMessage) => historyMessage.messageId,
    )
    newMessages.forEach((newMessage) => {
      if (historyMessageKeys.includes(newMessage.messageId)) {
        return
      }
      setHistoryMessages((prev) => [...prev, newMessage])
    })
  }, [clientWritingMessage])
  return {
    currentFloatingContextMenuDraft,
    activeMessageIndex,
    goToNextMessage,
    goToPreviousMessage,
    resetFloatingContextMenuDraft,
  }
}
export default useFloatingContextMenuDraft
