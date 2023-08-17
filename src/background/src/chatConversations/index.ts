import { v4 as uuidV4 } from 'uuid'
import { IChatMessage, IUserChatMessage } from '@/features/chatgpt/types'
import { IAIProviderType } from '@/background/provider/chat'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { ISidebarConversationType } from '@/features/sidebar'

export interface IChatConversation {
  id: string // 对话ID
  title: string // 对话标题
  created_at: string // 创建时间
  updated_at: string // 更新时间
  messages: IChatMessage[] // 对话中的消息列表
  type: ISidebarConversationType // 对话类型
  meta: IChatConversationMeta // 对话元数据
}

// 元数据
export interface IChatConversationMeta {
  AIProvider?: IAIProviderType // AI提供商
  AIModel?: string // AI模型
  AIConversationId?: string // AI对话ID
  systemPrompt?: string // 系统提示
  maxTokens?: number // 最大生成长度
  maxHistoryCount?: number // 最大历史记录数
  temperature?: number // 温度
  topP?: number // topP
  presencePenalty?: number // presencePenalty
  frequencyPenalty?: number // frequencyPenalty
  bestOf?: number // bestOf
  [key: string]: any
}

class ConversationDB {
  private databaseName: string // 数据库名称
  private databaseVersion: number // 数据库版本
  private objectStoreName: string // 对象存储名称

  /**
   * 创建一个 ConversationDB 实例。
   *
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
   *
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
   *
   * @param conversation 要添加或更新的对话对象
   * @returns Promise 对象，表示操作的异步结果
   */
  public addOrUpdateConversation(
    conversation: IChatConversation,
  ): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase()

        const transaction = db.transaction([this.objectStoreName], 'readwrite')
        const objectStore = transaction.objectStore(this.objectStoreName)

        objectStore.put(conversation)

        transaction.oncomplete = () => {
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
   *
   * @param conversationId 要删除的对话的 ID
   * @returns Promise 对象，表示操作的异步结果
   */
  public deleteConversation(conversationId: string): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase()

        const transaction = db.transaction([this.objectStoreName], 'readwrite')
        const objectStore = transaction.objectStore(this.objectStoreName)

        objectStore.delete(conversationId)

        transaction.oncomplete = () => {
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
   * 根据对话 ID 获取对话。
   *
   * @param conversationId 要获取的对话的 ID
   * @returns Promise 对象，解析为对应的对话对象，如果找不到则解析为 undefined
   */
  public getConversationById(
    conversationId: string,
  ): Promise<IChatConversation | undefined> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase()

        const transaction = db.transaction([this.objectStoreName], 'readonly')
        const objectStore = transaction.objectStore(this.objectStoreName)

        const request = objectStore.get(conversationId)

        request.onsuccess = (event) => {
          const conversation = (event.target as any)?.result as
            | IChatConversation
            | undefined
          resolve(conversation) // 解析 Promise 为获取到的对话对象
        }

        request.onerror = (event) => {
          reject((event.target as any)?.error || '') // 操作出错，拒绝 Promise 并传递错误信息
        }
      } catch (error) {
        reject(error) // 操作出错，拒绝 Promise 并传递错误信息
      }
    })
  }

  /**
   * 获取所有对话。
   *
   * @returns Promise 对象，解析为包含所有对话的数组
   */
  public getAllConversations(): Promise<IChatConversation[]> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase()

        const transaction = db.transaction([this.objectStoreName], 'readonly')
        const objectStore = transaction.objectStore(this.objectStoreName)

        const request = objectStore.getAll()

        request.onsuccess = (event) => {
          const conversations = ((event.target as any)?.result ||
            []) as IChatConversation[]
          resolve(conversations) // 解析 Promise 为包含所有对话的数组
        }

        request.onerror = (event) => {
          reject((event.target as any)?.error || '') // 操作出错，拒绝 Promise 并传递错误信息
        }
      } catch (error) {
        reject(error) // 操作出错，拒绝 Promise 并传递错误信息
      }
    })
  }

  /**
   * 删除所有不必要的对话。
   */
  public async removeUnnecessaryConversations(): Promise<void> {
    const allConversations = await this.getAllConversations()
    const waitDeleteConversations: IChatConversation[] = []
    let necessaryConversations = allConversations.filter((conversation) => {
      // 如果对话距离当前超过 3 天，则认为是不必要的对话
      const maxConversationAge = 3 * 24 * 60 * 60 * 1000
      const lastActiveTime = new Date(conversation.updated_at).getTime()
      const now = new Date().getTime()
      if (now - lastActiveTime <= maxConversationAge) {
        return true
      }
      waitDeleteConversations.push(conversation)
      return false
    })
    // 按照最后活跃时间排序，最后活跃时间越早的越靠前
    necessaryConversations = necessaryConversations.sort((a, b) => {
      const aLastActiveTime = new Date(a.updated_at).getTime()
      const bLastActiveTime = new Date(b.updated_at).getTime()
      return aLastActiveTime - bLastActiveTime
    })
    // 只保留最近的 30 个对话
    for (let i = 0; i < necessaryConversations.length - 30; i++) {
      waitDeleteConversations.push(necessaryConversations[i])
    }
    await Promise.all(
      waitDeleteConversations.map((conversation) =>
        this.deleteConversation(conversation.id),
      ),
    )
  }
}

export default class ConversationManager {
  static conversationDB = new ConversationDB(
    'conversationDB',
    1,
    'conversations',
  )
  static async createConversation(newConversation: Partial<IChatConversation>) {
    const defaultConversation: IChatConversation = {
      id: uuidV4(),
      title: 'Chat',
      type: 'Chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
      meta: {},
    }
    const saveConversation = mergeWithObject([
      defaultConversation,
      newConversation,
    ])
    await this.conversationDB.addOrUpdateConversation(saveConversation)
    // 异步清除无用的对话
    this.conversationDB.removeUnnecessaryConversations().then().catch()
    return saveConversation as IChatConversation
  }
  static async getClientConversation(conversationId: string) {
    const conversation = await this.conversationDB.getConversationById(
      conversationId,
    )
    if (conversation) {
      // 更新最后访问时间
      conversation.updated_at = new Date().toISOString()
      await this.conversationDB.addOrUpdateConversation(conversation)
      // 瘦身
      conversation.messages = conversation.messages.map((message) => {
        // 因为要发给客户端，所以需要瘦身
        if (message.type === 'user') {
          const userMessage = message as IUserChatMessage
          if (userMessage.extra.meta?.contextMenu) {
            userMessage.text = userMessage.extra.meta.contextMenu.text
            userMessage.extra.meta.contextMenu.data = undefined as any
          }
          return userMessage
        }
        return message
      })
    }
    console.log('新版Conversation getConversation', conversation)
    return conversation
  }
  static async pushMessages(
    conversationId: string,
    newMessages: IChatMessage[],
  ) {
    const conversation = await this.conversationDB.getConversationById(
      conversationId,
    )
    if (!conversation) {
      return false
    }
    conversation.messages = conversation.messages.concat(newMessages)
    await this.conversationDB.addOrUpdateConversation(conversation)
    return true
  }
  static async deleteMessages(conversationId: string, deleteCount: number) {
    const conversation = await this.conversationDB.getConversationById(
      conversationId,
    )
    if (!conversation) {
      return false
    }
    let finallyDeleteCount = deleteCount
    if (deleteCount > conversation.messages.length) {
      finallyDeleteCount = conversation.messages.length
    }
    conversation.messages = conversation.messages.slice(
      0,
      conversation.messages.length - finallyDeleteCount,
    )
    // save
    await this.conversationDB.addOrUpdateConversation(conversation)
    return true
  }
}
