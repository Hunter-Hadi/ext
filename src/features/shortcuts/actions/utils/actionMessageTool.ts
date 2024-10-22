import last from 'lodash-es/last'

import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'

/**
 * @since 2024-03-20
 * @description 停止action的message Status
 */
export const stopActionMessageStatus = async (params: {
  engine: IShortcutEngineExternalEngine
}) => {
  try {
    const currentConversationId = await params.engine.clientConversationEngine
      ?.currentConversationIdRef.current
    if (currentConversationId) {
      // 这里的messageIds是时间从新到旧排序
      const messageIds = await ClientConversationMessageManager.getMessageIds(
        currentConversationId,
      )
      const lastAIMessageId = messageIds[0] || last(messageIds)
      const lastAIMessage =
        await ClientConversationMessageManager.getMessageByMessageId(
          lastAIMessageId!,
        )
      if (!lastAIMessage) {
        return
      }
      if (lastAIMessage.originalMessage) {
        await ClientConversationMessageManager.updateMessagesWithChanges(
          currentConversationId,
          [
            {
              key: lastAIMessage.messageId,
              changes: {
                'originalMessage.metadata.sources.status': 'complete',
                'originalMessage.metadata.isComplete': true,
              } as any,
            },
          ],
        )
      }
    }
  } catch (e) {
    console.log('stopActionMessageStatus error:', e)
  }
}
