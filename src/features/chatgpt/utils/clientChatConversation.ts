import { IChatMessage } from '@/features/chatgpt/types'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { ChatConversation } from '@/background/src/chatConversations'

export const clientChatConversationModifyChatMessages = async (
  action: 'add' | 'delete' | 'clear',
  conversationId: string,
  deleteCount: number,
  newMessages: IChatMessage[],
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
  updateConversationData: Partial<ChatConversation>,
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
