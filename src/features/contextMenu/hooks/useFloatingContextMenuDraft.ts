import { useEffect, useMemo, useRef, useState } from 'react'
import { atomFamily, useRecoilState } from 'recoil'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { IAIResponseMessage, IUserChatMessage } from '@/features/chatgpt/types'
import {
  isAIMessage,
  isSystemMessageByStatus,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
/**
 * AI持续生成的草稿和用户选择的答案
 * @description - 因为AI的regenerate会删除消息，所以需要一个历史消息记录去让用户选择需要的AI response
 */
const FloatingContextMenuDraftActiveIndexState = atomFamily<number, string>({
  key: 'FloatingContextMenuDraftActiveIndexState',
  default: 0,
})
const useFloatingContextMenuDraft = () => {
  const {
    clientWritingMessage,
    clientConversationMessages,
    currentConversationId,
  } = useClientConversation()
  const [activeMessageIndex, setActiveMessageIndex] = useRecoilState(
    FloatingContextMenuDraftActiveIndexState(currentConversationId || ''),
  )
  const [historyMessages, setHistoryMessages] = useState<IAIResponseMessage[]>(
    [],
  )

  /**
   * 原先的historyMessages是每次调用这个hook会创建一个新的state
   * 导致了在多处使用useFloatingContextMenuDraft的时候historyMessages都是不同的
   * useEffect里依赖history去更新activeMessageIndex，每个hook里都会做处理导致activeMessageIndex修改异常
   * 看下是改成以下这样，还是说context menu的history应该放在recoil里
   */
  // const historyMessages = useMemo(() => {
  //   return clientConversationMessages.filter(
  //     (item) => isAIMessage(item) || isSystemMessageByStatus(item, 'error'),
  //   ) as IAIResponseMessage[]
  // }, [clientConversationMessages])

  const activeAIResponseMessage = historyMessages[activeMessageIndex]
  useEffect(() => {
    if (activeAIResponseMessage) {
      floatingContextMenuDraftMessageIdRef.current =
        activeAIResponseMessage.messageId
    }
  }, [activeAIResponseMessage])
  const floatingContextMenuDraftMessageIdRef = useRef<string | null>(
    activeAIResponseMessage?.messageId || null,
  )
  const currentFloatingContextMenuDraft = useMemo(() => {
    const activeMessage = historyMessages[activeMessageIndex]
    let draft = ''
    if (activeMessage && isSystemMessageByStatus(activeMessage, 'error')) {
      // 如果是报错消息
      return draft
    }
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
    if (
      activeAIResponseMessage &&
      isSystemMessageByStatus(activeAIResponseMessage, 'error')
    ) {
      return null
    }
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
    const newMessages = clientConversationMessages.filter(
      (item) => isAIMessage(item) || isSystemMessageByStatus(item, 'error'),
    ) as IAIResponseMessage[]
    console.log('clientConversationMessages', clientConversationMessages)
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
    console.log(
      'clientConversationMessages historyMessages',
      historyMessages.length,
      historyMessages,
    )
    setActiveMessageIndex(historyMessages.length - 1)
  }, [historyMessages])

  useEffect(() => {
    resetFloatingContextMenuDraft()
  }, [currentConversationId])

  return {
    floatingContextMenuDraftMessageIdRef,
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
