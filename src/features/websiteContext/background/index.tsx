import { v4 as uuidV4 } from 'uuid'
import { mergeWithObject } from '@/utils/dataHelper/objectHelper'
import { analyzeWebsiteContextMetaData } from '@/features/websiteContext/background/analyzeWebsiteContextMetaData'
import { ISidebarConversationType } from '@/features/sidebar'

export interface IWebsiteContext {
  id: string
  host: string
  url: string
  created_at: string // 创建时间
  updated_at: string // 更新时间
  sidebarType: ISidebarConversationType // sidebarType
  title?: string // 标题
  html?: string // html内容
  pageContext?: string // 页面主要的内容
  summary?: string // 总结
  embedContext?: string // embedContext
  meta?: IWebsiteContextMeta // meta
}
export interface IWebsiteContextMeta {
  readability?: string // mozilla
  youtubeTranscript?: string[]
  jsonLD?: any
  openGraph?: {
    title?: string
    type?: string
    url?: string
    description?: string
    image?: string[]
  }
  title?: string
  description?: string
  logo?: string
  favicon?: string
  screenshot?: string // base64Data - chrome.tabs.captureVisibleTab
}

export class WebsiteContextDB {
  private databaseName: string // 数据库名称
  private databaseVersion: number // 数据库版本
  private objectStoreName: string // 对象存储名称
  /**
   * 创建实例。
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
          objectStore.createIndex('id', 'id', { unique: true })
          objectStore.createIndex('title', 'title', { unique: false })
          objectStore.createIndex('url', 'url', { unique: false })
        }
      }
    })
  }
  addOrUpdateWebsite(website: IWebsiteContext): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase()

        const transaction = db.transaction([this.objectStoreName], 'readwrite')
        const objectStore = transaction.objectStore(this.objectStoreName)
        // 更新updated_at
        website.updated_at = new Date().toISOString()
        objectStore.put(website)

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
   * 删除
   *
   * @param websiteId 要删除的网站数据的 ID
   * @returns Promise 对象，表示操作的异步结果
   */
  deleteWebsiteContext(websiteId: string): Promise<void> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase()

        const transaction = db.transaction([this.objectStoreName], 'readwrite')
        const objectStore = transaction.objectStore(this.objectStoreName)

        objectStore.delete(websiteId)

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
   * @param websiteId 要获取的对话的 ID
   * @returns Promise 对象，解析为对应的网站数据对象，如果找不到则解析为 undefined
   */
  getWebsiteContextById(
    websiteId: string,
  ): Promise<IWebsiteContext | undefined> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase()

        const transaction = db.transaction([this.objectStoreName], 'readonly')
        const objectStore = transaction.objectStore(this.objectStoreName)

        const request = objectStore.get(websiteId)

        request.onsuccess = (event) => {
          const websiteContext = (event.target as any)?.result as
            | IWebsiteContext
            | undefined
          resolve(websiteContext) // 解析 Promise 为获取到的对话对象
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
   * 获取所有网站信息。
   *
   * @returns Promise 对象，解析为包含所有网站信息的数组
   */
  getAllWebsiteContext(): Promise<IWebsiteContext[]> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.openDatabase()

        const transaction = db.transaction([this.objectStoreName], 'readonly')
        const objectStore = transaction.objectStore(this.objectStoreName)

        const request = objectStore.getAll()

        request.onsuccess = (event) => {
          const websiteContexts = ((event.target as any)?.result ||
            []) as IWebsiteContext[]
          resolve(websiteContexts) // 解析 Promise 为包含所有对话的数组
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
   * 删除冷数据
   */
  async removeUnnecessaryWebsiteContext(): Promise<void> {
    const allWebsiteContexts = await this.getAllWebsiteContext()
    const waitDeleteWebsiteContext: IWebsiteContext[] = []
    let necessaryWebsiteContexts = allWebsiteContexts.filter(
      (websiteContext) => {
        // 如果对话距离当前超过 365 天，则认为是不必要的对话
        const maxWebsiteContextAge = 365 * 24 * 60 * 60 * 1000
        const lastActiveTime = new Date(websiteContext.updated_at).getTime()
        const now = new Date().getTime()
        if (now - lastActiveTime <= maxWebsiteContextAge) {
          return true
        }
        waitDeleteWebsiteContext.push(websiteContext)
        return false
      },
    )
    // 按照最后活跃时间排序，最后活跃时间越早的越靠前
    necessaryWebsiteContexts = necessaryWebsiteContexts.sort((a, b) => {
      const aLastActiveTime = new Date(a.updated_at).getTime()
      const bLastActiveTime = new Date(b.updated_at).getTime()
      return aLastActiveTime - bLastActiveTime
    })
    // 只保留最近的 3000 个对话
    for (let i = 0; i < necessaryWebsiteContexts.length - 3000; i++) {
      waitDeleteWebsiteContext.push(necessaryWebsiteContexts[i])
    }
    await Promise.all(
      waitDeleteWebsiteContext.map((websiteContext) =>
        this.deleteWebsiteContext(websiteContext.id),
      ),
    )
  }
  async clearAllWebsiteContexts() {
    const allWebsiteContexts = await this.getAllWebsiteContext()
    await Promise.all(
      allWebsiteContexts.map((websiteContext) =>
        this.deleteWebsiteContext(websiteContext.id),
      ),
    )
  }
}
const fullUrlToHost = (url?: string) => {
  try {
    if (url && url.startsWith('http')) {
      const host = new URL(url).host.replace(/^www\./, '').replace(/:\d+$/, '')
      // lark doc的子域名是动态的，所以需要特殊处理
      if (host.includes('larksuite.com')) {
        return 'larksuite.com'
      }
    }
    return ''
  } catch (e) {
    return ''
  }
}

export default class WebsiteContextManager {
  static websiteContextDB = new WebsiteContextDB(
    'websiteContextDB',
    1,
    'website_context',
  )
  static async createWebsiteContext(
    websiteContext: Partial<IWebsiteContext>,
  ): Promise<IWebsiteContext> {
    let baseWebsiteContext: IWebsiteContext = mergeWithObject([
      {
        id: uuidV4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        host: websiteContext.host || fullUrlToHost(websiteContext.url),
        url: '',
        meta: {},
        sidebarType: 'Chat',
      },
      websiteContext,
    ])
    if (websiteContext.id) {
      const findWebsiteContext = await this.websiteContextDB.getWebsiteContextById(
        websiteContext.id,
      )
      if (findWebsiteContext) {
        baseWebsiteContext = mergeWithObject([
          baseWebsiteContext,
          findWebsiteContext,
        ])
      }
    }
    await this.websiteContextDB.addOrUpdateWebsite(
      mergeWithObject([baseWebsiteContext, websiteContext]),
    )
    const analyzedWebsiteContext = await this.analyzeWebsiteContextMetaData(
      baseWebsiteContext.id,
      websiteContext.html,
    )
    console.log(
      'createWebsiteContext',
      analyzedWebsiteContext || baseWebsiteContext,
    )
    this.websiteContextDB.removeUnnecessaryWebsiteContext()
    return analyzedWebsiteContext || baseWebsiteContext
  }
  static async updateWebsiteContext(
    websiteId: string,
    websiteContext: Partial<IWebsiteContext>,
  ): Promise<IWebsiteContext | null> {
    const findWebsiteContext = await this.websiteContextDB.getWebsiteContextById(
      websiteId,
    )
    if (!findWebsiteContext) {
      return null
    }
    const newWebsiteContext = mergeWithObject([
      findWebsiteContext,
      websiteContext,
    ])
    await this.websiteContextDB.addOrUpdateWebsite(newWebsiteContext)
    return newWebsiteContext
  }

  static async getWebsiteContextById(
    websiteId: string,
  ): Promise<IWebsiteContext | undefined> {
    return this.websiteContextDB.getWebsiteContextById(websiteId)
  }
  static async getAllWebsiteContext(): Promise<IWebsiteContext[]> {
    return this.websiteContextDB.getAllWebsiteContext()
  }
  static async clearAllWebsiteContexts() {
    return this.websiteContextDB.clearAllWebsiteContexts()
  }
  static async deleteWebsiteContext(websiteId: string) {
    return this.websiteContextDB.deleteWebsiteContext(websiteId)
  }
  static async analyzeWebsiteContextMetaData(websiteId: string, html?: string) {
    if (!websiteId) {
      return
    }
    const currentWebsiteContext = await WebsiteContextManager.websiteContextDB.getWebsiteContextById(
      websiteId,
    )
    if (!currentWebsiteContext) {
      return
    }
    if (html) {
      currentWebsiteContext.html = html
    }
    if (currentWebsiteContext.html) {
      // 开始分析meta
      const metaData = await analyzeWebsiteContextMetaData(
        currentWebsiteContext.url,
        currentWebsiteContext.html,
      )
      currentWebsiteContext.meta = mergeWithObject([
        currentWebsiteContext.meta,
        metaData,
      ])
      // 减少储存占用
      currentWebsiteContext.html = ''
    }
    await WebsiteContextManager.websiteContextDB.addOrUpdateWebsite(
      currentWebsiteContext,
    )
    return currentWebsiteContext
  }
}
