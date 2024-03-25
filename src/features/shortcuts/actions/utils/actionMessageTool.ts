import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'

/**
 * @since 2024-03-20
 * @description 停止action的message 消息
 */
export const stopActionMessageStatus = async (params: {
  engine: IShortcutEngineExternalEngine
}) => {
  try {
    const currentConversation =
      await params.engine.clientConversationEngine?.getCurrentConversation()
    if (currentConversation && currentConversation.id) {
      const conversationUpdatedDate = +new Date(currentConversation.updated_at)
      let lastUpdateMessageId = currentConversation.messages?.[0]?.messageId
      if (currentConversation.messages.length > 1) {
        //大于1，利用时间进行排序，一般大于1的action只有ask-chatgpt(ask-chatgpt 自己有stop),所以并不会过多的进入该sort算法浪费资源
        lastUpdateMessageId = currentConversation.messages.sort((a, b) => {
          if (a.updated_at === undefined) return 1
          if (b.updated_at === undefined) return -1
          const dateA = +new Date(a.updated_at)
          const dateB = +new Date(b.updated_at)
          // 计算每个消息更新时间与会话更新时间的时间差
          const diffA = Math.abs(dateA - conversationUpdatedDate)
          const diffB = Math.abs(dateB - conversationUpdatedDate)
          // 将时间差更小（即更接近会话更新时间）的消息排在前面
          return diffA - diffB
        })?.[0]?.messageId
      }

      //停止的消息状态变更
      if (currentConversation.id && lastUpdateMessageId) {
        await clientChatConversationModifyChatMessages(
          'update',
          currentConversation.id,
          0,
          [
            {
              type: 'ai',
              messageId: lastUpdateMessageId,
              originalMessage: {
                metadata: {
                  sources: {
                    status: 'complete',
                  },
                  isComplete: true,
                },
              },
            } as any,
          ],
        )
      }
    }
  } catch (e) {
    console.log('stopActionMessageStatus error:', e)
  }
}
