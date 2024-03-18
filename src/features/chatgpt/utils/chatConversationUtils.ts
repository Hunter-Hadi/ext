import {
  IChatConversation,
  PaginationConversation,
} from '@/background/src/chatConversations'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { ISidebarConversationType } from '@/features/sidebar/types'

export const clientGetConversation = async (conversationId: string) => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getLiteConversation',
      data: {
        conversationId,
      },
    })
    return result.success ? (result.data as IChatConversation) : undefined
  } catch (e) {
    return undefined
  }
}
/**
 * 强制删除conversation
 * @description - 因为正常的删除是切换conversation，但是这里是直接在indexDB删除整个conversation
 * @param conversationId
 */
export const clientForceRemoveConversation = async (conversationId: string) => {
  try {
    const port = new ContentScriptConnectionV2({})
    const result = await port.postMessage({
      event: 'Client_removeChatGPTConversation',
      data: {
        conversationId,
        isForceRemove: true,
      },
    })
    return result.success
  } catch (e) {
    return false
  }
}
/**
 * 获取所有的conversation
 */
export const clientGetAllConversations = async () => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getAllConversation',
    })
    return result.success ? (result.data as IChatConversation[]) : undefined
  } catch (e) {
    return []
  }
}
/**
 * 获取分页的conversation数据
 */
export const clientGetAllPaginationConversations = async () => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_getAllPaginationConversation',
    })
    return result.success ? (result.data as PaginationConversation[]) : []
  } catch (e) {
    return []
  }
}
/**
 * 删除所有的conversation
 */
export const clientRemoveAllConversations = async () => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_removeAllConversation',
    })
    return result.success
  } catch (e) {
    return false
  }
}
/**
 * 根据type删除conversation
 * @param type
 */
export const clientRemoveConversationsByType = async (
  type: ISidebarConversationType,
) => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_removeConversationByType',
      data: {
        type,
      },
    })
    return result.success
  } catch (e) {
    return false
  }
}
