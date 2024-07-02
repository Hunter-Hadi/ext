import { IAIProviderType } from '@/background/provider/chat'
import { IPageSummaryType } from '@/features/chat-base/summary/types'
import {
  IChatMessage,
  IChatUploadFile,
} from '@/features/indexed_db/conversations/models/Message'
import { IShortCutsParameter } from '@/features/shortcuts/hooks/useShortCutsParameters'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import { ISidebarConversationType } from '@/features/sidebar/types'

export interface IConversation {
  authorId: string // 作者ID
  id: string // 对话ID
  name: string // 对话名称
  title: string // 对话类型标题
  created_at: string // 创建时间
  updated_at: string // 更新时间
  /**
   * @deprecated - 2024-05-14 - 3.0版本后废弃
   */
  messages: IChatMessage[] // 对话中的消息列表
  type: ISidebarConversationType // 对话类型
  meta: IConversationMeta // 对话元数据
  isDelete: boolean // 软删除
  share?: IConversationShareConfig // 分享配置
  // 2024-01-22后用2.0, 在此之前需要上传到后端
  // 2024-05-14后用3.0, 单独存储消息和attachments
  version?: number // 版本号
  lastMessageId?: string // 最后一条消息的ID
}

// 分享配置
export interface IConversationShareConfig {
  enable?: boolean
  id?: string
  /**
   * @deprecated - 2024-05-27 - 3.0版本后废弃
   */
  shareType?: 'public' | 'private'
  /**
   * @deprecated - 2024-05-27 - 3.0版本后废弃
   */
  enabled?: boolean
  /**
   * @deprecated - 2024-05-27 - 3.0版本后废弃
   */
  shareId?: string
}

// 元数据
export interface IConversationMeta {
  AIProvider?: IAIProviderType // AI提供商
  AIModel?: string // AI模型
  AIConversationId?: string // AI对话ID
  systemPrompt?: string // 系统提示
  maxTokens?: number // 最大生成长度
  maxHistoryCount?: number // 最大历史记录数
  temperature?: number // 温度
  topP?: number // topP
  docId?: string // 聊天文档id
  attachments?: IChatUploadFile[] // 附件
  domain?: string //创建的时候的域名
  path?: string // 创建的时候的路径
  /**
   * summary类型，这个暂时保留，某些代码还是从这里取数据
   */
  pageSummaryType?: IPageSummaryType
  /**
   * 存储summary的信息，后端设计summary也需要携带一个docId
   * @since 2024-06-26
   */
  pageSummary?: {
    // summary时传的docId，并且后续聊天也要带上这个(长文还是用meta.docId)
    docId?: string
    // summary类型
    type?: IPageSummaryType
    // summary网页内容，4.3.9开始不存储在systemPrompt里了
    // 这里保留是因为先留给web pdf使用，以及summary报错后，后续的chat需要带上这个内容
    content?: string
  }
  /**
   * @deprecated - 2024-05-14 - 3.0版本后废弃 - 因为不上传到后端
   * 最后运行的shortcuts
   */
  lastRunActions?: ISetActionsType
  /**
   * @deprecated - 2024-05-14 - 3.0版本后废弃 - 因为不上传到后端
   * 最后运行的shortcuts的params, 在regenerate/retry时用到
   */
  lastRunActionsParams?: IShortCutsParameter[]
  /**
   * @deprecated - 2024-05-14 - 3.0版本后废弃 - 因为不上传到后端
   * 最后运行的shortcuts的messageID, 在regenerate/retry时用到
   */
  lastRunActionsMessageId?: string

  // NOTE: 本来只有AI summary的时候才有这个字段，但是通达老师要求conversation也有这个字段
  // SINCE: 2024-06-24
  // 来源于哪个网站
  sourceWebpage?: {
    title?: string
    url?: string
    favicon?: string
  }
  [key: string]: any
}

export interface IPaginationConversation {
  id: string // 对话ID
  name: string // 对话名称
  title: string // 对话类型标题
  created_at: string // 创建时间
  updated_at: string // 更新时间
  type: ISidebarConversationType // 对话类型
  lastMessage: IChatMessage | null
  AIProvider?: IAIProviderType // AI提供商
  AIModel?: string // AI模型
  // 非Conversation字段
  conversationDisplaysTime: string // 显示时间
  conversationDisplaysText: string // 显示的对话文本
}
