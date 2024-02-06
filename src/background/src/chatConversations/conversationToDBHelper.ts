import cloneDeep from 'lodash-es/cloneDeep'

import { IChatConversation } from '@/background/src/chatConversations/index'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { IChatMessage } from '@/features/chatgpt/types'

export const maxAIRequest = async (path: string, data: any) => {
  return await fetch(`${APP_USE_CHAT_GPT_API_HOST}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
}

/**
 * 获取DB中的conversation的简要信息
 * @description
 * - 这个接口通过conversation_ids数组返回相关conversation基本数据
 * - 可以用于判断conversation在后端是否存在
 * @param conversationIds
 */
export const getDBConversationExist = async (conversationIds: string[]) => {
  await maxAIRequest('/conversation/get_conversations_basic_by_ids', {
    conversation_ids: conversationIds,
  })
}

/**
 * 获取DB中的conversation的详细信息
 * @param conversationId
 */
export const getDBConversationDetail = async (conversationId: string) => {
  await maxAIRequest('/conversation/get_conversation', {
    conversation_id: conversationId,
  })
}

/**
 * 创建或更新Conversation
 * @param conversation
 */
export const addOrUpdateDBConversation = async (
  conversation: IChatConversation,
) => {
  //TODO: 年前不需要被动创建或更新Conversation, 除了要分享的chat被删除
  const uploadConversation: any = cloneDeep(conversation)
  if (uploadConversation) {
    // 不需要保存messages
    delete uploadConversation.messages
  }
  await maxAIRequest('/conversation/upsert_conversation', uploadConversation)
}

/**
 * 分享Conversation
 * @param conversationId
 * @param shareConfig
 */
export const shareConversation = async (
  conversationId: string,
  shareConfig: {
    share_enabled: boolean
  },
) => {
  await maxAIRequest('/conversation/share_conversation', {
    conversation_id: conversationId,
    share_enabled: shareConfig.share_enabled,
  })
}

const maxAIMessageRequest = async (
  path: string,
  data: any,
  conversation: IChatConversation,
) => {
  try {
    let response = await maxAIRequest(path, data)
    if (response.status === 404) {
      // 说明conversation不存在, 需要创建
      await addOrUpdateDBConversation(conversation)
      response = await maxAIRequest(path, data)
    }
    return response
  } catch (e) {
    return undefined
  }
}

/**
 * 添加/更新messages到DB中的conversation
 * @param conversation
 * @param messages
 */
export const addOrUpdateDBConversationMessages = async (
  conversation: IChatConversation,
  messages: IChatMessage[],
) => {
  try {
    if (!conversation.share?.shareId) {
      return false
    }
    console.log('DB_Conversation addOrUpdateDBConversationMessages', messages)
    const response = await maxAIMessageRequest(
      '/conversation/add_messages',
      {
        conversation_id: conversation.id,
        messages,
      },
      conversation,
    )
    if (response?.ok && response?.status === 200) {
      const data = await response.json()
      return data.status === 'OK'
    }
    return false
  } catch (e) {
    return false
  }
}
/**
 * 删除DB中的conversation中的message
 * @param conversation
 * @param messageIds
 */
export const deleteDBConversationMessages = async (
  conversation: IChatConversation,
  messageIds: string[],
) => {
  try {
    console.log('DB_Conversation deleteMessages', messageIds)
    const response = await maxAIMessageRequest(
      '/conversation/delete_messages',
      {
        conversation_id: conversation.id,
        message_ids: messageIds,
      },
      conversation,
    )
    if (response?.ok && response?.status === 200) {
      const data = await response.json()
      return data.status === 'OK'
    }
    return false
  } catch (e) {
    return false
  }
}

/**
 * 获取DB中的conversation的messages
 * @param conversation
 * @param filters
 */
export const getDBConversationMessages = async (
  conversation: IChatConversation,
  filters?: {
    page?: number
    page_size?: number
    start_time?: number
    end_time?: number
  },
) => {
  try {
    const response = await maxAIMessageRequest(
      '/conversation/get_messages',
      {
        conversation_id: conversation.id,
        ...filters,
      },
      conversation,
    )
    debugger
    return true
  } catch (e) {
    debugger
    return false
  }
}
