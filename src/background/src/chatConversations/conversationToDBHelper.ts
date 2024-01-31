import cloneDeep from 'lodash-es/cloneDeep'

import { IChatConversation } from '@/background/src/chatConversations/index'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { IChatMessage } from '@/features/chatgpt/types'

export const maxAIRequest = async <T>(path: string, data: any) => {
  return await fetch(`${APP_USE_CHAT_GPT_API_HOST}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  }).then((res) => (res.json() as any) as T)
}

/**
 * 获取DB中的conversation的简要信息
 * @description
 * - 这个接口通过conversation_ids数组返回相关conversation基本数据
 * - 可以用于判断conversation在后端是否存在
 * @param conversationIds
 */
export const getDBConversationExist = async (conversationIds: string[]) => {
  await maxAIRequest<{
    data: IChatConversation[]
  }>('/conversation/get_conversations_basic_by_ids', {
    conversation_ids: conversationIds,
  })
}

/**
 * 获取DB中的conversation的详细信息
 * @param conversationId
 */
export const getDBConversationDetail = async (conversationId: string) => {
  await maxAIRequest<{
    data: IChatConversation
  }>('/conversation/get_conversation', {
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
  const uploadConversation: any = cloneDeep(conversation)
  if (uploadConversation) {
    // 不需要保存messages
    delete uploadConversation.messages
  }
  await maxAIRequest('/conversation/upsert_conversation', conversation)
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

/**
 * 添加message到DB中的conversation
 * @param conversationId
 * @param messages
 */
export const pushMessageToDBConversation = async (
  conversationId: string,
  messages: IChatMessage[],
) => {
  await maxAIRequest('/conversation/add_messages', {
    conversation_id: conversationId,
    messages,
  })
}
/**
 * 删除DB中的conversation中的message
 * @param conversationId
 * @param messageIds
 */
export const deleteMessageFromDBConversation = async (
  conversationId: string,
  messageIds: string[],
) => {
  await maxAIRequest('/conversation/delete_messages', {
    conversation_id: conversationId,
    message_ids: messageIds,
  })
}

/**
 * 获取DB中的conversation的messages
 * @param conversationId
 * @param filters
 */
export const getDBConversationMessages = async (
  conversationId: string,
  filters?: {
    page?: number
    page_size?: number
    start_time?: number
    end_time?: number
  },
) => {
  await maxAIRequest<{
    data: IChatMessage[]
  }>('/conversation/get_messages', {
    conversation_id: conversationId,
    ...filters,
  })
}
