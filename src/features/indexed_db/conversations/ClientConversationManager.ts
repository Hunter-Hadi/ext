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
import OneShotCommunicator from '@/utils/OneShotCommunicator'

export class ClientConversationManager {
  /**
   * 推送对话变更
   * @param changeType
   * @param conversationIds
   * @private
   */
  private static notifyConversationChange(
    changeType: 'add' | 'update' | 'delete',
    conversationIds: string[],
  ) {
    // 通知对话消息变更
    OneShotCommunicator.send('ConversationUpdate', {
      changeType,
      conversationIds,
    })
      .then()
      .catch()
  }
  /**
   * 获取conversation
   * @param conversationId
   * @param force - 无视isDelete和authorId
   */
  static getConversationById = async (
    conversationId: string,
    force = false,
  ) => {
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
   * 用conversationIds获取对话
   * @param conversationIds
   * @param force
   */
  static getConversationsByIds = async (
    conversationIds: string[],
    force = false,
  ) => {
    try {
      const conversations = (
        await createIndexedDBQuery('conversations')
          .conversations.where('id')
          .anyOf(conversationIds)
          .toArray()
          .then()
      ).filter((conversation) => conversation?.id)
      if (!force) {
        const authorId = await getMaxAIChromeExtensionUserId()
        return conversations.filter(
          (conversation) =>
            !conversation.isDelete && conversation.authorId === authorId,
        )
      }
      return conversations
    } catch (e) {
      return []
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
    const cacheConversation =
      await ClientConversationManager.getConversationById(conversationId, true)
    const saveData = mergeWithObject([
      cacheConversation || {},
      updateConversationData,
      duplicate ? { id: uuidV4() } : {},
    ])
    await createIndexedDBQuery('conversations')
      .conversations.put(saveData)
      .then()
    this.notifyConversationChange(
      cacheConversation && !duplicate ? 'update' : 'add',
      [conversationId],
    )
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
    const isRemoveSuccess = await clientUseIndexedDB(
      'ConversationDBRemoveConversation',
      {
        conversationId,
        softDelete: true,
      },
    )
    if (isRemoveSuccess) {
      this.notifyConversationChange('delete', [conversationId])
    }
    const conversation = await ClientConversationManager.getConversationById(
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
      conversationIds.forEach((conversationId) => {
        this.notifyConversationChange('delete', [conversationId])
      })
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
      const conversation = await ClientConversationManager.getConversationById(
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
   * 获取所有对话ids
   * @param force - 是否强制获取
   */
  static async getAllConversationIds(force: boolean = false) {
    try {
      const authorId = await getMaxAIChromeExtensionUserId()
      const conversationsIds = await createIndexedDBQuery('conversations')
        .conversations.where({
          authorId,
          ...(force
            ? {}
            : {
                isDelete: false,
              }),
        })
        .toArray(getProjectionFields(['id']))
        .then()
      return conversationsIds as string[]
    } catch (e) {
      return []
    }
  }
  /**
   * 获取所有对话
   * @param force - 是否强制获取
   */
  static async getAllConversations(force: boolean = false) {
    try {
      const conversationIds = await this.getAllConversationIds(force)
      // 因为获取indexedDB的数据是通过postMessage的方式，所以这里不能一次性获取所有数据，否则会导致数据过大，无法传输
      // 这里循环获取数据
      const messages: IConversation[] = []
      const chunkSize = 50
      for (let i = 0; i < conversationIds.length; i += chunkSize) {
        const partOfConversationIds = conversationIds.slice(i, i + chunkSize)
        const result = await createIndexedDBQuery('conversations')
          .conversations.where('id')
          .anyOf(partOfConversationIds)
          .toArray()
          .then()
        messages.push(...result)
      }
      console.log(`ConversationDB[V3] 获取对话`, messages)
      return messages
    } catch (e) {
      console.log(`ConversationDB[V3] 获取对话失败`, e)
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
        if (cloneRemoteConversation.version !== 3) {
          await clientUseIndexedDB('ConversationDBMigrateConversationV3', {
            conversation: cloneRemoteConversation,
          })
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
