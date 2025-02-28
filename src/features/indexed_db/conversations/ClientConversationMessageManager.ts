import { UpdateSpec } from 'dexie'
import cloneDeep from 'lodash-es/cloneDeep'
import orderBy from 'lodash-es/orderBy'
import { v4 as uuidV4 } from 'uuid'

import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import {
  clientDeleteMessagesToRemote,
  clientUploadMessagesToRemote,
} from '@/features/indexed_db/conversations/clientService'
import {
  IAIResponseMessage,
  IChatMessage,
  ISystemChatMessage,
  IUserChatMessage,
} from '@/features/indexed_db/conversations/models/Message'
import {
  clientUseIndexedDB,
  createIndexedDBQuery,
  getProjectionFields,
} from '@/features/indexed_db/utils'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

export class ClientConversationMessageManager {
  /**
   * 处理消息
   * @param conversationId
   * @param messages
   * @private
   */
  private static processMessages(
    conversationId: string,
    messages: IChatMessage[],
  ) {
    return cloneDeep(messages).map((message, index) => {
      if (!message.messageId) {
        message.messageId = uuidV4()
      }
      if (!message.parentMessageId) {
        message.parentMessageId = messages[index - 1]?.messageId || ''
      }
      if (!message.created_at) {
        message.created_at = new Date().toISOString()
        message.updated_at = new Date().toISOString()
      }
      if (!message.conversationId) {
        message.conversationId = conversationId
      }
      message.conversationId = conversationId
      return message
    })
  }

  /**
   * 推送对话消息变更
   * @param changeType
   * @param conversationId
   * @param messageIds
   * @private
   */
  private static notifyConversationMessageChange(
    changeType: 'add' | 'update' | 'delete',
    conversationId: string,
    messageIds: string[],
  ) {
    // 通知对话消息变更
    OneShotCommunicator.send('ConversationMessagesUpdate', {
      changeType,
      conversationId,
      messageIds,
    })
      .then()
      .catch()
  }

  /**
   * 异步上传对话最后消息ID
   * @param conversationId
   * @private
   */
  private static async asyncUploadConversationLastMessageId(
    conversationId: string,
  ) {
    const lastMessage = await this.getMessageByTimeFrame(
      conversationId,
      'latest',
    )
    console.log(`ConversationDB[V3] 异步上传对话最后消息ID`, lastMessage)
    const conversation = await ClientConversationManager.getConversationById(
      conversationId,
    )
    if (lastMessage?.messageId && conversation) {
      if (conversation.lastMessageId !== lastMessage.messageId) {
        await ClientConversationManager.addOrUpdateConversation(
          conversationId,
          {
            lastMessageId: lastMessage.messageId,
          },
          {
            syncConversationToDB: true,
          },
        )
      }
    }
  }

  /**
   * 获取对话消息Ids
   * @param conversationId
   */
  static async getMessageIds(conversationId: string): Promise<string[]> {
    try {
      const messagesIdWithCreatedList = (await createIndexedDBQuery(
        'conversations',
      )
        .messages.where('[conversationId+created_at+messageId]')
        .between([conversationId, ''], [conversationId, '\uffff'])
        .keys()
        .then()) as [string, string, string][]
      const sortedList = messagesIdWithCreatedList.sort((prev, next) => {
        // [conversationId, created_at, messageId]
        return new Date(next[1]).getTime() - new Date(prev[1]).getTime()
      })
      console.log(`ConversationDB[V3] 获取消息Ids数量`, sortedList.length)
      return sortedList.map((item) => item[2])
    } catch (e) {
      console.log(`ConversationDB[V3] 获取消息Ids数量失败`, e)
      return []
    }
  }

  /**
   * 获取所有消息
   * @param conversationId
   */
  static async getMessages(conversationId: string) {
    try {
      const messagesIds = await this.getMessageIds(conversationId)
      // 因为获取indexedDB的数据是通过postMessage的方式，所以这里不能一次性获取所有数据，否则会导致数据过大，无法传输
      // 这里循环获取数据
      let messages: IChatMessage[] = []
      const chunkSize = 50
      for (let i = 0; i < messagesIds.length; i += chunkSize) {
        const messageIds = messagesIds.slice(i, i + chunkSize)
        const result = await createIndexedDBQuery('conversations')
          .messages.where('messageId')
          .anyOf(messageIds)
          .toArray()
          .then()
        messages.push(...result)
      }
      messages = orderBy(messages, ['created_at'], ['desc'])
      console.log(`ConversationDB[V3] 获取全部消息`, messages)
      return messages
    } catch (e) {
      console.log(`ConversationDB[V3] 获取全部消息失败`, e)
      return []
    }
  }

  /**
   * 基于消息ID获取消息
   * @param messageId
   */
  static async getMessageByMessageId(messageId: string) {
    try {
      const message = await createIndexedDBQuery('conversations')
        .messages.get(messageId)
        .then()
      console.log(`ConversationDB[V3] 获取消息`, message)
      return message || null
    } catch (e) {
      console.log(`ConversationDB[V3] 获取消息失败`, e)
      return null
    }
  }

  /**
   * 基于消息IDs获取消息
   * @param messageIds
   */
  static async getMessagesByMessageIds(messageIds: string[]) {
    try {
      const messages = await createIndexedDBQuery('conversations')
        .messages.where('messageId')
        .anyOf(messageIds)
        .toArray()
        .then()
      const orderByArray = orderBy(messages, ['created_at'], ['desc'])
      console.log(`ConversationDB[V3] 获取消息`, orderByArray)
      return orderByArray
    } catch (e) {
      console.log(`ConversationDB[V3] 获取消息失败`, e)
      return []
    }
  }
  /**
   * 添加消息
   * @param conversationId
   * @param messages
   */
  static async addMessages(conversationId: string, messages: IChatMessage[]) {
    try {
      if (messages.length === 0) {
        return true
      }
      const saveMessages = this.processMessages(conversationId, messages)
      const result = await createIndexedDBQuery('conversations')
        .messages.bulkPut(saveMessages)
        .then()
      this.notifyConversationMessageChange(
        'add',
        conversationId,
        saveMessages.map((item) => item.messageId),
      )
      await this.asyncUploadConversationLastMessageId(conversationId)
        .then()
        .catch()
      clientUploadMessagesToRemote(conversationId, saveMessages).then().catch()
      console.log(`ConversationDB[V3] 添加消息`, result)
      return result
    } catch (e) {
      console.log(`ConversationDB[V3] 添加或更新消息失败`, e)
      return false
    }
  }
  /**
   * 更新消息
   * @param conversationId
   * @param messageChanges
   * @param options
   * @inheritdoc https://dexie.org/docs/Table/Table.bulkUpdate()
   */
  static async updateMessagesWithChanges(
    conversationId: string,
    messageChanges: ReadonlyArray<{
      key: string
      changes: UpdateSpec<IChatMessage>
    }>,
    options?: {
      notifyChange?: boolean
      syncMessageToDB?: boolean
    },
  ) {
    try {
      const { notifyChange = true, syncMessageToDB = true } = options || {}
      if (messageChanges.length === 0) {
        return true
      }
      const updateResult = await createIndexedDBQuery('conversations')
        .messages.bulkUpdate(
          messageChanges.map((item) => {
            item.changes.updated_at = new Date().toISOString()
            item.changes.conversationId = conversationId
            return item
          }),
        )
        .then()
      console.log(`ConversationDB[V3] 更新消息`, updateResult)
      const changedMessageIds = messageChanges.map((item) => item.key)
      this.notifyConversationMessageChange(
        'update',
        conversationId,
        changedMessageIds,
      )
      if (notifyChange) {
        await this.asyncUploadConversationLastMessageId(conversationId)
          .then()
          .catch()
      }
      const updatedMessages = await this.getMessagesByMessageIds(
        changedMessageIds,
      )
      const validMessages: IChatMessage[] = []
      updatedMessages.forEach((message) => {
        if (message) {
          validMessages.push(message)
        }
      })
      if (syncMessageToDB) {
        clientUploadMessagesToRemote(conversationId, validMessages)
          .then()
          .catch()
      }
      return updateResult
    } catch (e) {
      console.log(`ConversationDB[V3] 更新消息失败`, e)
      return false
    }
  }

  /**
   * 更新消息
   * @param conversationId
   * @param updateMessageData
   * @param options
   */
  static async updateMessage(
    conversationId: string,
    updateMessageData: Partial<
      IUserChatMessage | IAIResponseMessage | ISystemChatMessage | IChatMessage
    >,
    options?: {
      notifyChange?: boolean
      syncMessageToDB?: boolean
    },
  ) {
    try {
      const { notifyChange = true, syncMessageToDB = true } = options || {}
      if (!updateMessageData.messageId) {
        return false
      }
      updateMessageData.updated_at = new Date().toISOString()
      updateMessageData.conversationId = conversationId
      const result = await createIndexedDBQuery('conversations')
        .messages.get(updateMessageData.messageId)
        .then()
      const mergeMessage = mergeWithObject([result, updateMessageData])
      const updateResult = await createIndexedDBQuery('conversations')
        .messages.put(mergeMessage)
        .then()
      if (notifyChange) {
        this.notifyConversationMessageChange('update', conversationId, [
          mergeMessage.messageId,
        ])
      }
      if (syncMessageToDB) {
        clientUploadMessagesToRemote(conversationId, [mergeMessage])
          .then()
          .catch()
      }
      await this.asyncUploadConversationLastMessageId(conversationId)
        .then()
        .catch()
      console.log(`ConversationDB[V3] 更新消息`, updateResult)
      return true
    } catch (e) {
      console.log(`ConversationDB[V3] 更新消息失败`, e)
      return false
    }
  }

  /**
   * TODO 这里是临时的做法，删除messages是记录当前正在删除的消息
   * 主要是防止正在拉取messages时，网速等其他原因返回较慢，这时候删除了messages
   * 会导致删除后消息又同步回来的问题
   */
  static deleteMessageIds: string[] = []

  /**
   * 删除消息
   * @param conversationId
   * @param messageIds
   * @param options
   * @param options.waitSync - 是否等待同步
   */
  static async deleteMessages(
    conversationId: string,
    messageIds: string[],
    options?: { waitSync?: boolean },
  ) {
    const { waitSync = false } = options || {}
    try {
      if (messageIds.length === 0) {
        return true
      }
      this.deleteMessageIds = [...this.deleteMessageIds, ...messageIds]
      const result = await clientUseIndexedDB('ConversationDBDeleteMessages', {
        conversationId,
        messageIds,
      })
      this.notifyConversationMessageChange('delete', conversationId, messageIds)
      if (waitSync) {
        await clientDeleteMessagesToRemote(conversationId, messageIds)
          .then()
          .catch()
          .finally(() => {
            this.deleteMessageIds = this.deleteMessageIds.filter(
              (messageId) => !messageIds.includes(messageId),
            )
          })
      } else {
        clientDeleteMessagesToRemote(conversationId, messageIds)
          .then()
          .catch()
          .finally(() => {
            this.deleteMessageIds = this.deleteMessageIds.filter(
              (messageId) => !messageIds.includes(messageId),
            )
          })
      }
      await this.asyncUploadConversationLastMessageId(conversationId)
        .then()
        .catch()
      return result
    } catch (e) {
      console.log(`ConversationDB[V3] 删除消息失败`, e)
      return false
    }
  }
  /**
   * 获取对话消息Ids
   * @param conversationId
   * @param timeFrame
   */
  static async getMessageByTimeFrame(
    conversationId: string,
    timeFrame: 'latest' | 'earliest' = 'latest',
  ) {
    try {
      const messageIds = await this.getMessageIds(conversationId)
      const targetMessageId =
        timeFrame === 'latest'
          ? messageIds[0]
          : messageIds[messageIds.length - 1]
      if (!targetMessageId) {
        return null
      }
      const message = await this.getMessageByMessageId(targetMessageId)
      console.log(`ConversationDB[V3] 获取${timeFrame}的消息`, message)
      return message
    } catch (error) {
      console.log(`ConversationDB[V3] 获取${timeFrame}的消息错误`, error)
      return null
    }
  }

  /**
   * 获取删除消息的消息Ids
   * @param conversationId
   * @param upToMessageId
   * @param timeFrame
   */
  static async getDeleteMessageIds(
    conversationId: string,
    upToMessageId: string,
    timeFrame: 'latest' | 'earliest' = 'latest',
  ) {
    try {
      const messagesIds = await this.getMessageIds(conversationId)
      const findIndex = messagesIds.findIndex((item) => item === upToMessageId)
      if (findIndex === -1) {
        return []
      }
      console.log(
        `ConversationDB[V3] 获取${timeFrame}的删除消息ids`,
        messagesIds,
        findIndex,
      )
      return timeFrame === 'latest'
        ? messagesIds.slice(0, findIndex)
        : messagesIds.slice(findIndex)
    } catch (e) {
      console.log(`ConversationDB[V3] 获取${timeFrame}的删除消息ids错误`, e)
      return []
    }
  }

  /**
   * 获取type类型的消息
   * @param conversationId
   * @param type
   * @param timeFrame
   * @example
   *
   * // 获取对话用户的第一条消息
   * const message = await ClientConversationMessageManager.getMessageByMessageType('user', 'latest')
   * // 获取对话用户的最后一条消息
   * const message = await ClientConversationMessageManager.getMessageByMessageType('user', 'earliest')
   *
   */
  static async getMessageByMessageType(
    conversationId: string,
    type: IChatMessage['type'],
    timeFrame: 'latest' | 'earliest' = 'latest',
  ) {
    try {
      const messagesIds = (await createIndexedDBQuery('conversations')
        .messages.where('conversationId')
        .equals(conversationId)
        .toArray(
          getProjectionFields<IChatMessage>([
            'messageId',
            'created_at',
            'type',
          ]),
        )
        .then()) as { messageId: string; type: string }[]
      const findItem = orderBy(
        messagesIds,
        ['created_at'],
        [timeFrame === 'latest' ? 'desc' : 'asc'],
      ).find((item) => item.type === type)
      const message = await this.getMessageByMessageId(
        findItem?.messageId || '',
      )
      console.log(
        `ConversationDB[V3] 获取${type}类型${timeFrame}的消息`,
        message,
      )
      return message
    } catch (e) {
      console.log(`ConversationDB[V3] 获取${type}类型的消息错误`, e)
      return null
    }
  }

  /**
   * 比较远程和本地的对话消息数据
   * @param conversationId
   * @param remoteMessages
   */
  static async diffRemoteConversationMessagesData(
    conversationId: string,
    remoteMessages: IChatMessage[],
  ) {
    const deleteMessageIds = this.deleteMessageIds
    const localMessageIds = await this.getMessageIds(conversationId)
    // 本地不存在的消息
    const notExistLocalMessages = remoteMessages.filter(
      (remoteMessage) =>
        !localMessageIds.includes(remoteMessage.messageId) &&
        !deleteMessageIds.includes(remoteMessage.messageId),
    )
    if (notExistLocalMessages.length > 0) {
      // 写入本地
      await this.addMessages(conversationId, notExistLocalMessages)
    }
    // 本地存在的消息，用远程存在的消息覆盖本地
    const existRemoteMessages = remoteMessages.filter((item) =>
      localMessageIds.includes(item.messageId),
    )
    // TODO: 这里本来最好的做法是对比updated_at，但是这里只是简单的覆盖
    // NOTE: 这里不用this.updateMessagesWithChanges，因为这里不需要通知变更也不需要上传远程
    //
    if (existRemoteMessages.length > 0) {
      for (const remoteMessage of existRemoteMessages) {
        await createIndexedDBQuery('conversations')
          .messages.put(remoteMessage)
          .then()
      }
    }
  }
}
