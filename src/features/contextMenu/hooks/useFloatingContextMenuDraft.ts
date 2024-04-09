import { useEffect, useMemo, useState } from 'react'
import { atom, useRecoilState } from 'recoil'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IAIResponseMessage, IUserChatMessage } from '@/features/chatgpt/types'
import {
  isAIMessage,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
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
  const {
    clientWritingMessage,
    clientConversationMessages,
    currentConversationId,
  } = useClientConversation()

  const [historyMessages, setHistoryMessages] = useState<IAIResponseMessage[]>(
    [],
  )
  const activeAIResponseMessage = historyMessages[activeMessageIndex]

  const currentFloatingContextMenuDraft = useMemo(() => {
    const activeMessage = historyMessages[activeMessageIndex]
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
  /**
   * 当前的draft对应的用户消息
   */
  const selectedDraftUserMessage = useMemo(() => {
    // if (!activeAIResponseMessage) {
    //   return null
    // }
    // const activeAIResponseMessageIndex = clientConversationMessages.findIndex(
    //   (message) => message.messageId === activeAIResponseMessage?.messageId,
    // )
    // if (activeAIResponseMessageIndex === -1) {
    //   return null
    // }
    //从后往前找到用户的消息
    for (let i = clientConversationMessages.length - 1; i >= 0; i--) {
      const message = clientConversationMessages[i]
      if (isUserMessage(message)) {
        return message as IUserChatMessage
      }
    }
    return null
  }, [activeAIResponseMessage, clientConversationMessages])
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

  useEffect(() => {
    const newMessages = clientConversationMessages.filter(isAIMessage)
    setHistoryMessages((prev) => {
      // 找得到messageId的更新，找不到的添加
      const newMessagesMap = newMessages.reduce((messageMap, message) => {
        messageMap[message.messageId] = message
        return messageMap
      }, {} as Record<string, IAIResponseMessage>)
      const oldHistory = prev.map((message) => {
        if (newMessagesMap[message.messageId]) {
          return newMessagesMap[message.messageId]
        }
        return message
      })
      const newHistory = newMessages.filter(
        (message) =>
          !oldHistory.find(
            (oldMessage) => oldMessage.messageId === message.messageId,
          ),
      )
      return [...oldHistory, ...newHistory]
    })
  }, [clientConversationMessages])

  useEffect(() => {
    if (historyMessages.length === 0) {
      return
    }
    setActiveMessageIndex(historyMessages.length - 1)
  }, [historyMessages])

  useEffect(() => {
    resetFloatingContextMenuDraft()
  }, [currentConversationId])
  return {
    selectedDraftUserMessage,
    activeAIResponseMessage,
    historyMessages,
    currentFloatingContextMenuDraft,
    activeMessageIndex,
    goToNextMessage,
    goToPreviousMessage,
    resetFloatingContextMenuDraft,
  }
}
export default useFloatingContextMenuDraft
