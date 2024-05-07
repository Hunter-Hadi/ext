import cloneDeep from 'lodash-es/cloneDeep'

import { IChatConversation } from '@/background/src/chatConversations/index'
import { backgroundGetBetaFeatureSettings } from '@/background/utils/maxAIBetaFeatureSettings/background'
import { APP_USE_CHAT_GPT_API_HOST } from '@/constants'
import {
  getMaxAIChromeExtensionAccessToken,
  getMaxAIChromeExtensionUserId,
} from '@/features/auth/utils'
import { IChatMessage } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'

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

const isEnableSyncConversation = async () => {
  const settings = await backgroundGetBetaFeatureSettings()
  return settings.chat_sync
}

/**
 * 获取DB中的conversation的简要信息
 * @description
 * - 这个接口通过conversation_ids数组返回相关conversation基本数据
 * - 可以用于判断conversation在后端是否存在
 * @param conversationIds
 */
export const getDBConversationExist = async (conversationIds: string[]) => {
  if (!(await isEnableSyncConversation())) {
    return
  }
  await maxAIRequest('/conversation/get_conversations_basic_by_ids', {
    conversation_ids: conversationIds,
  })
}

/**
 * 获取DB中的conversation的详细信息
 * @param conversationId
 */
export const getDBConversationDetail = async (conversationId: string) => {
  if (!(await isEnableSyncConversation())) {
    return
  }
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
  if (!(await isEnableSyncConversation())) {
    return
  }
  const uploadConversation: any = cloneDeep(conversation)
  if (uploadConversation) {
    if (!uploadConversation.authorId) {
      uploadConversation.authorId = await getMaxAIChromeExtensionUserId()
    }
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
  if (!(await isEnableSyncConversation())) {
    return
  }
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
    if (!(await isEnableSyncConversation())) {
      return undefined
    }
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
  if (messages.length === 0) {
    return
  }
  try {
    if (!(await isEnableSyncConversation())) {
      return false
    }
    const filteredMessages = messages
      .filter((message) => {
        if (isAIMessage(message)) {
          if (message.originalMessage) {
            return message.originalMessage.metadata?.isComplete
          }
        }
        return message
      })
      .map((message) => {
        if (!message.parentMessageId) {
          message.parentMessageId = ''
        }
        return message
      })
    if (filteredMessages.length === 0) {
      return
    }
    console.log(
      'DB_Conversation addOrUpdateDBConversationMessages',
      filteredMessages,
    )
    const response = await maxAIMessageRequest(
      '/conversation/add_messages',
      {
        conversation_id: conversation.id,
        messages: filteredMessages,
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
  if (messageIds.length === 0) {
    return
  }
  try {
    if (!(await isEnableSyncConversation())) {
      return false
    }
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
    if (!(await isEnableSyncConversation())) {
      return
    }
    await maxAIMessageRequest(
      '/conversation/get_messages',
      {
        conversation_id: conversation.id,
        ...filters,
      },
      conversation,
    )
    return true
  } catch (e) {
    return false
  }
}
