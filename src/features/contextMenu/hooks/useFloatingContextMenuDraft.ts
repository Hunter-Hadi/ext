import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import { IChatMessage } from '@/features/chatgpt/types'
import { FloatingContextMenuDraftState } from '@/features/contextMenu'
import { useRecoilValue } from 'recoil'
import { useMemo } from 'react'
/**
 * AI持续生成的草稿
 */
const useFloatingContextMenuDraft = () => {
  const { currentSidebarConversationMessages } = useSidebarSettings()
  const conversation = useRecoilValue(ChatGPTConversationState)
  const floatingContextMenuDraft = useRecoilValue(FloatingContextMenuDraftState)
  const aiMessages: IChatMessage[] = []
  let lastAIMessageId = floatingContextMenuDraft.lastAIMessageId
  return useMemo(() => {
    if (!lastAIMessageId) {
      // 因为lastAIMessageId是上一次AI message的id，所以如果只有一个AI message，那么lastAIMessageId就是root
      if (
        currentSidebarConversationMessages.filter(
          (message) => message.type === 'ai',
        ).length === 1
      ) {
        lastAIMessageId = 'root'
      }
    }
    if (lastAIMessageId) {
      // 从后往前找，直到找到最近的AI message
      for (let i = currentSidebarConversationMessages.length - 1; i >= 0; i--) {
        const message = currentSidebarConversationMessages[i]
        if (message.messageId === lastAIMessageId) {
          break
        }
        if (message.type === 'ai') {
          // 因为是从后往前找，所以插入到最前面
          aiMessages.unshift(message)
        }
      }
    }
    if (conversation.writingMessage) {
      if (conversation.writingMessage.type === 'ai') {
        aiMessages.push(conversation.writingMessage)
      }
    }
    console.log(
      'AiInput aiMessages',
      lastAIMessageId,
      aiMessages,
      conversation.writingMessage,
    )
    const draft = aiMessages
      .map((message) => message.text)
      .join('\n\n')
      .replace(/\n{2,}/, '\n\n')
    return draft
  }, [conversation.writingMessage, currentSidebarConversationMessages])
}
export default useFloatingContextMenuDraft
