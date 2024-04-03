import { useEffect, useMemo, useState } from 'react'
import { atom, useRecoilState } from 'recoil'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
/**
 * AI持续生成的草稿和用户选择的答案
 * @description - 因为AI的regenerate会删除消息，所以需要一个历史消息记录去让用户选择需要的AI response
 */
const FloatingContextMenuDraftActiveIndexState = atom<number>({
  key: 'FloatingContextMenuDraftActiveIndexState',
  default: 0,
})
const useFloatingContextMenuDraft = () => {
  const [activeMessageIndex, setActiveMessageIndex] = useRecoilState(
    FloatingContextMenuDraftActiveIndexState,
  )
  const { clientWritingMessage, clientConversationMessages } =
    useClientConversation()

  const [historyMessages, setHistoryMessages] = useState<IAIResponseMessage[]>(
    [],
  )
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

  const currentFloatingContextMenuDraft = useMemo(() => {
    const activeMessage = historyMessages[activeMessageIndex]
    console.log(
      'useFloatingContextMenuDraft activeMessage: ',
      activeMessage?.messageId,
      clientWritingMessage.writingMessage?.messageId,
      activeMessage?.text,
    )
    let draft = ''
    if (activeMessage) {
      draft = activeMessage.text
    }
    if (clientWritingMessage.writingMessage?.messageId) {
      // 如果当前正在输入的消息是当前激活的消息，那么需要合并
      if (
        clientWritingMessage.writingMessage.messageId ===
        activeMessage?.messageId
      ) {
        draft = draft + '\n\n' + clientWritingMessage.writingMessage.text
      } else {
        // 否则直接使用当前输入的消息
        draft = clientWritingMessage.writingMessage.text
      }
    }
    return draft.replace(/\n{2,}/, '\n\n')
  }, [clientWritingMessage.writingMessage, historyMessages, activeMessageIndex])

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
  }, [clientConversationMessages])

  useEffect(() => {
    if (historyMessages.length === 0) {
      return
    }
    setActiveMessageIndex(historyMessages.length - 1)
  }, [historyMessages])

  return {
    historyMessages,
    currentFloatingContextMenuDraft,
    activeMessageIndex,
    goToNextMessage,
    goToPreviousMessage,
    resetFloatingContextMenuDraft,
  }
}
export default useFloatingContextMenuDraft
