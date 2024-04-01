import { orderBy } from 'lodash-es'

import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'
import { clientChatConversationModifyChatMessages } from '@/features/chatgpt/utils/clientChatConversation'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'

/**
 * @since 2024-03-20
 * @description 停止action的message Status
 */
export const stopActionMessageStatus = async (params: {
  engine: IShortcutEngineExternalEngine
}) => {
  try {
    const currentConversation =
      await params.engine.clientConversationEngine?.getCurrentConversation()
    if (currentConversation && currentConversation.id) {
      const messagesSortByTime = orderBy(
        currentConversation.messages.filter(isAIMessage),
        (message) =>
          message.updated_at ? new Date(message.updated_at).getTime() : -1,
        ['desc'],
      )
      const lastAIMessage = messagesSortByTime[0]
      if (!lastAIMessage) {
        return
      }
      if (lastAIMessage.originalMessage) {
        await clientChatConversationModifyChatMessages(
          'update',
          currentConversation.id,
          0,
          [
            {
              type: 'ai',
              messageId: lastAIMessage.messageId,
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
