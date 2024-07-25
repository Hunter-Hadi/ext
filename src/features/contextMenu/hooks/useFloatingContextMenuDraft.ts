import dayjs from 'dayjs'
import { useEffect, useMemo, useRef } from 'react'
import { atomFamily, useRecoilState, useSetRecoilState } from 'recoil'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  isAIMessage,
  isSystemMessage,
  isSystemMessageByStatus,
  isSystemMessageByType,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
import {
  IAIResponseMessage,
  ISystemChatMessage,
  IUserChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import { formatChatMessageContent } from '@/features/sidebar/utils/chatMessagesHelper'

type HistoryMessage = (IAIResponseMessage | ISystemChatMessage) & {
  // 本条消息对应的draft message
  selectedDraftMessage?: IUserChatMessage | null
}

/**
 * AI持续生成的草稿和用户选择的答案
 * @description - 因为AI的regenerate会删除消息，所以需要一个历史消息记录去让用户选择需要的AI response
 */
const FloatingContextMenuDraftHistoryState = atomFamily<
  {
    activeIndex: number
    historyMessages: HistoryMessage[]
  },
  string
>({
  key: 'FloatingContextMenuDraftHistoryState',
  default: {
    activeIndex: 0,
    historyMessages: [],
  },
})

/**
 * 原先的historyMessages是每次调用useFloatingContextMenuDraft会创建一个新的state
 * 导致了在多处使用useFloatingContextMenuDraft的时候historyMessages都是不同的
 * useEffect里依赖history去更新activeMessageIndex，某些组件在重新mount的时候更新导致activeMessageIndex修改异常
 *
 * 这里拆出监听消息变化的函数
 */
const useFloatingContextMenuDraftHistoryChange = () => {
  const { clientConversationMessages, currentConversationId } =
    useClientConversation()
  const setHistoryState = useSetRecoilState(
    FloatingContextMenuDraftHistoryState(currentConversationId || ''),
  )
  useEffect(() => {
    const newMessagesMap: Record<string, HistoryMessage> = {}
    const now = Date.now()
    const conversationMessage = [...clientConversationMessages]
    const newMessages = conversationMessage
      // 可能需要排序，因为查询回来的结果可能是init状态desc顺序
      .sort(
        (a, b) =>
          dayjs(a.created_at || now).valueOf() -
          dayjs(b.created_at || now).valueOf(),
      )
      .map((message, index) => {
        // 目前context window里只显示ai/付费卡点/错误消息
        if (isAIMessage(message)) {
          const prevMessage = conversationMessage[index - 1]
          const selectedDraftMessage =
            prevMessage && isUserMessage(prevMessage) ? prevMessage : null
          return (newMessagesMap[message.messageId] = {
            ...message,
            selectedDraftMessage,
          })
        } else if (
          isSystemMessageByType(message, 'needUpgrade') ||
          isSystemMessageByStatus(message, 'error')
        ) {
          return (newMessagesMap[message.messageId] = {
            ...message,
          } as HistoryMessage)
        }
        return null
      })
      .filter(Boolean) as HistoryMessage[]

    setHistoryState((prev) => {
      // 找得到messageId的更新，找不到的添加
      const oldHistory = prev.historyMessages.map((message) => {
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
      const newHistoryMessages = [...oldHistory, ...newHistory]
      return {
        ...prev,
        activeIndex: newHistoryMessages.length - 1,
        historyMessages: newHistoryMessages,
      }
    })
  }, [clientConversationMessages])
}

const useFloatingContextMenuDraft = () => {
  const { clientWritingMessage, currentConversationId } =
    useClientConversation()
  const [historyState, setHistoryState] = useRecoilState(
    FloatingContextMenuDraftHistoryState(currentConversationId || ''),
  )
  const { activeIndex: activeMessageIndex, historyMessages } = historyState

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
    if (activeMessage && isSystemMessage(activeMessage)) {
      // 如果是系统消息
      return draft
    }
    if (activeMessage) {
      draft = formatChatMessageContent(activeMessage, false)
    }
    if (clientWritingMessage.writingMessage?.messageId) {
      // 如果当前正在输入的消息是当前激活的消息，那么需要合并
      if (
        clientWritingMessage.writingMessage.messageId ===
          activeMessage?.messageId &&
        clientWritingMessage.loading // 加上loading，否则会有短暂的重复添加消息导致contextmenu高度闪烁
      ) {
        draft =
          draft +
          '\n\n' +
          formatChatMessageContent(clientWritingMessage.writingMessage, false)
      } else {
        // 否则直接使用当前输入的消息
        draft = formatChatMessageContent(
          clientWritingMessage.writingMessage,
          false,
        )
      }
    }
    return draft.replace(/\n{2,}/, '\n\n')
  }, [
    clientWritingMessage.writingMessage,
    clientWritingMessage.loading,
    historyMessages,
    activeMessageIndex,
  ])

  const goToNextMessage = () => {
    setHistoryState((prev) => ({
      ...prev,
      activeIndex: prev.activeIndex + 1,
    }))
  }

  const goToPreviousMessage = () => {
    setHistoryState((prev) => ({
      ...prev,
      activeIndex: prev.activeIndex - 1,
    }))
  }

  const resetFloatingContextMenuDraft = () => {
    setHistoryState({
      historyMessages: [],
      activeIndex: 0,
    })
  }

  return {
    floatingContextMenuDraftMessageIdRef,
    selectedDraftUserMessage: activeAIResponseMessage?.selectedDraftMessage,
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
export { useFloatingContextMenuDraftHistoryChange }
