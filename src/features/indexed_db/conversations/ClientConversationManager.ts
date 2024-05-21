import cloneDeep from 'lodash-es/cloneDeep'
import { v4 as uuidV4 } from 'uuid'

import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { ClientConversationMessageManager } from '@/features/indexed_db/conversations/ClientConversationMessageManager'
import {
  deleteRemoteConversationByType,
  downloadRemoteMessagesToClient,
  uploadClientConversationToRemote,
} from '@/features/indexed_db/conversations/clientService'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatMessage } from '@/features/indexed_db/conversations/models/Message'
import {
  clientUseIndexedDB,
  createIndexedDBQuery,
  dbSift,
  getProjectionFields,
} from '@/features/indexed_db/utils'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

export class ClientConversationManager {
  /**
   * 获取conversation
   * @param conversationId
   * @param force - 无视isDelete和authorId
   */
  static getConversation = async (conversationId: string, force = false) => {
    try {
      const conversation = await createIndexedDBQuery('conversations')
        .conversations.get(conversationId)
        .then()
      if (conversation) {
        if (!force) {
          if (conversation.isDelete) {
            return null
          }
          if (
            conversation.authorId !== (await getMaxAIChromeExtensionUserId())
          ) {
            return null
          }
        }
        return conversation
      }
      return null
    } catch (e) {
      return null
    }
  }
  /**
   * 更新对话
   * @param conversationId
   * @param updateConversationData
   * @param options
   * @param options.duplicate - 是否复制对话
   * @param options.waitSync - 是否等待同步
   * @param options.syncConversationToDB - 是否同步到远程
   */
  static addOrUpdateConversation = async (
    conversationId: string,
    updateConversationData: Partial<IConversation>,
    options?: {
      duplicate?: boolean
      syncConversationToDB?: boolean
      waitSync?: boolean
    },
  ) => {
    const {
      syncConversationToDB = false,
      waitSync = false,
      duplicate = false,
    } = options || {}
    if (!conversationId) {
      return
    }
    const cacheConversation = await ClientConversationManager.getConversation(
      conversationId,
      true,
    )
    const saveData = mergeWithObject([
      cacheConversation || {},
      updateConversationData,
      duplicate ? { id: uuidV4() } : {},
    ])
    await createIndexedDBQuery('conversations')
      .conversations.put(saveData)
      .then()
    if (syncConversationToDB) {
      if (waitSync) {
        await uploadClientConversationToRemote(saveData)
      } else {
        uploadClientConversationToRemote(saveData).then().catch()
      }
    }
    return saveData
  }
  /**
   * 删除对话
   * @description - 客户端只能软删除
   * @param conversationId
   */
  static softDeleteConversation = async (conversationId: string) => {
    await clientUseIndexedDB('ConversationDBRemoveConversation', {
      conversationId,
      softDelete: true,
    })
    const conversation = await ClientConversationManager.getConversation(
      conversationId,
      true,
    )
    // 同步到远程
    conversation && (await uploadClientConversationToRemote(conversation))
  }

  static softDeleteByType = async (type: ISidebarConversationType) => {
    const conversations: IConversation[] = await createIndexedDBQuery(
      'conversations',
    )
      .conversations.where('type')
      .equals(type)
      .filter(
        dbSift({
          isDelete: { $eq: false },
          authorId: { $eq: await getMaxAIChromeExtensionUserId() },
        }),
      )
      .toArray(getProjectionFields(['id']))
      .then()
    const conversationIds = conversations.map((conversation) => conversation.id)
    if (await deleteRemoteConversationByType(type)) {
      // 批量软删除
      await createIndexedDBQuery('conversations')
        .conversations.where('id')
        .anyOf(conversationIds)
        .modify({ isDelete: true })
        .then()
    }
  }

  /**
   * 在 client 根据 conversationId 获取 conversation 中的 ai model 和 provider
   * @param conversationId
   */
  static getConversationAIProviderAndAIModel = async (
    conversationId: string,
  ) => {
    try {
      const conversation = await ClientConversationManager.getConversation(
        conversationId,
      )
      return {
        AIModel: conversation?.meta.AIModel,
        AIProvider: conversation?.meta.AIProvider,
      }
    } catch (e) {
      return {
        AIModel: null,
        AIProvider: null,
      }
    }
  }

  /**
   * 升级到v3用的⬇️️️️️️️️⬇️⬇️
   */
  static async getAllOldVersionConversationIds() {
    try {
      const port = new ContentScriptConnectionV2()
      const result = await port.postMessage({
        event: 'Client_getAllOldVersionConversationIds',
      })
      return result.success ? (result.data as string[]) : []
    } catch (e) {
      return []
    }
  }

  /**
   * 对比分页对话数据
   * @param APIConversations - 接口获取的对话数据
   */
  static diffRemoteConversationData = async (
    APIConversations: IConversation[],
  ) => {
    const remoteConversationIds = APIConversations.map(
      (conversation) => conversation.id,
    )
    const localConversations = await createIndexedDBQuery('conversations')
      .conversations.where('id')
      .anyOf(remoteConversationIds)
      .toArray()
      .then()
    // 对比 updated_at
    for (const remoteConversation of APIConversations) {
      const localConversation = localConversations.find(
        (conversation) => conversation.id === remoteConversation.id,
      )
      const cloneRemoteConversation = cloneDeep(remoteConversation)
      let last_msg: IChatMessage | null =
        (cloneRemoteConversation as any)?.last_msg || null
      // 如果有last_msg，就不用再去查了
      if (last_msg) {
        cloneRemoteConversation.lastMessageId = last_msg.messageId
        delete (cloneRemoteConversation as any).last_msg
      } else if (cloneRemoteConversation.lastMessageId) {
        // 获取最后一条消息
        last_msg = await ClientConversationMessageManager.getMessageByMessageId(
          cloneRemoteConversation.lastMessageId,
        )
        if (!last_msg) {
          last_msg = (
            await downloadRemoteMessagesToClient(cloneRemoteConversation.id, [
              cloneRemoteConversation.lastMessageId,
            ])
          )?.[0]
        }
      }
      // 如果本地没有，添加到本地
      if (!localConversation) {
        // 添加消息到本地
        if (last_msg?.messageId && last_msg.updated_at) {
          // 更新对话
          await createIndexedDBQuery('conversations')
            .messages.put(last_msg)
            .then()
        }
        const isV3 = cloneRemoteConversation.version === 3
        const isSuccess = await clientUseIndexedDB(
          'ConversationDBMigrateConversationV3',
          {
            conversation: cloneRemoteConversation,
          },
        )
        // 如果之前不是v3，且成功了，就更新remote
        if (!isV3 && isSuccess) {
          uploadClientConversationToRemote(cloneRemoteConversation)
            .then()
            .catch()
        }
        continue
      }
      if (
        new Date(cloneRemoteConversation.updated_at).getTime() >=
        new Date(localConversation.updated_at).getTime()
      ) {
        // 更新对话
        await createIndexedDBQuery('conversations')
          .conversations.put(cloneRemoteConversation)
          .then()
      }
    }
  }
}
