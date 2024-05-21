import { v4 as uuidV4 } from 'uuid'

import { backgroundAddOrUpdateDBConversation } from '@/background/src/chatConversations/conversationToDBHelper'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import {
  backgroundConversationDB,
  backgroundConversationDBRemoveConversation,
  backgroundMigrateConversationV3,
} from '@/features/indexed_db/conversations/background'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'

export const getAllOldVersionConversationIds = (): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('conversationDB', 1)
    request.onsuccess = (event) => {
      try {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(['conversations'], 'readonly')
        const objectStore = transaction.objectStore('conversations')
        // only get conversationIds
        const cursor = objectStore.openKeyCursor()
        const conversationIds: string[] = []
        cursor.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result
          if (cursor) {
            conversationIds.push(cursor.key as string)
            cursor.continue()
          } else {
            resolve(conversationIds)
          }
        }
        cursor.onerror = (event) => {
          resolve([])
        }
      } catch (e) {
        resolve([])
      }
    }
  })
}

/**
 * @deprecated - 已经废弃了, 用features/idnexed_db 2023-05-15
 * - 理论上除了getConversationById, 其他方法都不应该再使用
 */
class OldVersionConversationDB {
  private databaseName: string // 数据库名称
  private databaseVersion: number // 数据库版本
  private objectStoreName: string // 对象存储名称

  /**
   * 创建一个 ConversationDB 实例。
   * @deprecated
   * @param databaseName 数据库名称
   * @param databaseVersion 数据库版本
   * @param objectStoreName 对象存储名称
   */
  constructor(
    databaseName: string,
    databaseVersion: number,
    objectStoreName: string,
  ) {
    this.databaseName = databaseName
    this.databaseVersion = databaseVersion
    this.objectStoreName = objectStoreName
  }

  /**
   * 打开 IndexedDB 数据库。
   * @deprecated
   * @returns Promise 对象，解析为 IDBDatabase 实例
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, this.databaseVersion)

      request.onerror = (event) => {
        reject((event.target as any)?.error || '') // 如果打开数据库发生错误，则拒绝 Promise 并传递错误信息
      }

      request.onsuccess = (event) => {
        const db = (event.target as any)?.result as IDBDatabase
        resolve(db) // 解析 Promise 为打开的数据库实例
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as any)?.result as IDBDatabase

        if (!db.objectStoreNames.contains(this.objectStoreName)) {
          // 如果对象存储不存在，则创建对象存储和索引
          const objectStore = db.createObjectStore(this.objectStoreName, {
            keyPath: 'id',
          })
          objectStore.createIndex('title', 'title', { unique: false })
        }
      }
    })
  }

  /**
   * 添加或更新对话。
   * @deprecated
   * @param conversation 要添加或更新的对话对象
   * @param options 是否需要更新到DB
   * @param options.syncConversationToDB 是否需要更新Conversation到DB
   * @returns Promise 对象，表示操作的异步结果
   */
  public addOrUpdateConversation(
    conversation: IConversation,
    options?: {
      syncConversationToDB?: boolean
      reason?: string
    },
  ): Promise<void> {
    const { syncConversationToDB = false, reason } = options || {}
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        console.log(
          `DB_Conversation addOrUpdateConversation [同步会话][${reason}]`,
          conversation,
        )
        const db = await this.openDatabase()
        const transaction = db.transaction([this.objectStoreName], 'readwrite')
        const objectStore = transaction.objectStore(this.objectStoreName)
        conversation.updated_at = new Date().toISOString()
        objectStore.put(conversation)
        transaction.oncomplete = () => {
          if (syncConversationToDB) {
            // 同步会话到后端
            // addOrUpdateDBConversation(conversation).then().catch()
          }
          resolve() // 操作成功完成，解析 Promise
        }
        transaction.onerror = (event) => {
          reject((event.target as any)?.error || '') // 操作出错，拒绝 Promise 并传递错误信息
        }
      } catch (error) {
        reject(error) // 操作出错，拒绝 Promise 并传递错误信息
      }
    })
  }
  /**
   * 删除对话。
   * @deprecated - 只为了迁移后能删掉老数据
   * @param conversationId 要删除的对话的 ID
   * @returns Promise 对象,表示操作的异步结果
   */
  public deleteConversation(conversationId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.openDatabase()
        .then((db) => {
          const transaction = db.transaction(
            [this.objectStoreName],
            'readwrite',
          )
          const objectStore = transaction.objectStore(this.objectStoreName)
          const request = objectStore.openKeyCursor(
            IDBKeyRange.only(conversationId),
          )
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>)
              .result
            if (cursor) {
              objectStore.delete(cursor.primaryKey)
              cursor.continue()
            } else {
              // 如果没有找到匹配的记录,直接解析 Promise
              resolve()
            }
          }
          transaction.oncomplete = () => {
            resolve()
          }
          transaction.onerror = (event) => {
            reject((event.target as any)?.error || '')
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * 根据对话 ID 获取对话。
   * @deprecated - 只为了获取老数据
   * @param conversationId 要获取的对话的 ID
   * @returns Promise 对象，解析为对应的对话对象，如果找不到则解析为 undefined
   */
  public async getConversationById(
    conversationId: string,
  ): Promise<IConversation | undefined> {
    const db = await this.openDatabase()
    const transaction = db.transaction([this.objectStoreName], 'readonly')
    const objectStore = transaction.objectStore(this.objectStoreName)

    return new Promise<IConversation | undefined>((resolve, reject) => {
      const request = objectStore.openKeyCursor(
        IDBKeyRange.only(conversationId),
      )
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          const request = objectStore.get(cursor.primaryKey)
          request.onsuccess = (event) => {
            const conversation = (event.target as any)?.result as
              | IConversation
              | undefined
            resolve(conversation)
          }
          request.onerror = (event) => {
            reject((event.target as any)?.error || '')
          }
        } else {
          resolve(undefined)
        }
      }
      request.onerror = (event) => {
        console.log('getConversationById error', event)
        resolve(undefined)
      }
    })
  }
}

export default class ConversationManager {
  /**
   * @deprecated
   */
  static oldVersionConversationDB = new OldVersionConversationDB(
    'conversationDB',
    1,
    'conversations',
  )

  /**
   * @param newConversation
   */
  static async createConversation(newConversation: Partial<IConversation>) {
    const defaultConversation: IConversation = {
      authorId: await getMaxAIChromeExtensionUserId(),
      id: uuidV4(),
      name: '',
      title: 'Chat',
      type: 'Chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [], // 虽然废弃了，但是为了兼容老数据，还是要加上
      meta: {},
      isDelete: false,
      version: 3,
      share: {
        shareId: undefined,
        shareType: 'private',
      },
    }
    const saveConversation: IConversation = mergeWithObject([
      defaultConversation,
      newConversation,
    ])
    console.log('ConversationDB[V3] createConversation', saveConversation)
    await backgroundConversationDB.conversations.put(saveConversation)
    return saveConversation as IConversation
  }

  static async addOrUpdateConversation(
    conversation: IConversation,
    options?: {
      syncConversationToDB?: boolean
      reason?: string
    },
  ) {
    const { syncConversationToDB = false, reason } = options || {}
    try {
      console.log(
        `DB_Conversation addOrUpdateConversation [同步会话][${reason}]`,
        conversation,
      )
      await backgroundConversationDB.conversations.put(conversation)
      if (syncConversationToDB) {
        // 同步会话到后端
        backgroundAddOrUpdateDBConversation(conversation).then().catch()
      }
      return true
    } catch (error) {
      console.error(error)
      return false
    }
  }

  /**
   * 软删除对话
   * @param conversationId
   */
  static async softDeleteConversation(conversationId: string) {
    return backgroundConversationDBRemoveConversation(conversationId, true)
  }

  /**
   * 彻底删除对话
   * @param conversationId
   */
  static async removeConversation(conversationId: string) {
    try {
      return backgroundConversationDBRemoveConversation(conversationId, false)
    } catch (e) {
      console.error(e)
      return false
    }
  }

  /**
   * 获取对话
   * @param conversationId
   */
  static async getConversationById(conversationId: string) {
    let conversation = await backgroundConversationDB.conversations.get(
      conversationId,
    )
    console.log(`ConversationDB[V3] getClientConversation`, conversation)
    if (!conversation) {
      // 如果没有找到对话，那么尝试从老版本中找
      const v2VersionConversation =
        await this.oldVersionConversationDB.getConversationById(conversationId)
      if (v2VersionConversation) {
        conversation = await backgroundMigrateConversationV3(
          v2VersionConversation,
        )
        console.log(
          'ConversationDB[V3] getClientConversation [升级老版本]',
          v2VersionConversation,
        )
      }
    }
    console.log('新版Conversation getConversation', conversation)
    return conversation
  }
}
