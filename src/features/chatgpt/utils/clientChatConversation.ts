import {
  IAIResponseMessage,
  IChatMessage,
  ISystemChatMessage,
  IUserChatMessage,
} from '@/features/chatgpt/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { IChatConversation } from '@/background/src/chatConversations'

export const clientChatConversationModifyChatMessages = async (
  action: 'add' | 'delete' | 'clear' | 'update',
  conversationId: string,
  deleteCount: number,
  newMessages: Array<
    IChatMessage | ISystemChatMessage | IAIResponseMessage | IUserChatMessage
  >,
) => {
  try {
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

export const clientChatConversationUpdate = async (
  conversationId: string,
  updateConversationData: Partial<IChatConversation>,
) => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_updateConversation',
      data: {
        conversationId,
        updateConversationData,
      },
    })
    return result.success
  } catch (e) {
    return false
  }
}
