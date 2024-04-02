import { IChatConversation } from '@/background/src/chatConversations'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import {
  IAIResponseMessage,
  IChatMessage,
  ISystemChatMessage,
  IUserChatMessage,
} from '@/features/chatgpt/types'

/**
 * Client更新Conversation的信息
 * @param action
 * @param conversationId
 * @param deleteCount
 * @param newMessages
 */
export const clientChatConversationModifyChatMessages = async (
  action: 'add' | 'delete' | 'clear' | 'update',
  conversationId: string,
  deleteCount: number,
  newMessages: Array<
    IChatMessage | ISystemChatMessage | IAIResponseMessage | IUserChatMessage
  >,
) => {
  try {
    console.log(
      'clientChatConversationModifyChatMessages',
      action,
      conversationId,
      newMessages,
    )
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_modifyMessages',
      data: {
        conversationId,
        action,
        deleteCount,
        newMessages,
      },
    })
    return result.success
  } catch (e) {
    return false
  }
}

/**
 * Client更新Conversation的信息
 * @param conversationId - 需要更新的conversationId
 * @param updateConversationData - 需要更新的数据
 * @param syncConversationToDB - 是否同步到服务器
 */

export const clientUpdateChatConversation = async (
  conversationId: string,
  updateConversationData: Partial<IChatConversation>,
  syncConversationToDB: boolean,
) => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_updateConversation',
      data: {
        conversationId,
        updateConversationData,
        syncConversationToDB,
      },
    })
    return result.success
  } catch (e) {
    return false
  }
}
