// 基础的聊天消息类型
export interface IChatMessage {
  type: 'user' | 'ai' | 'system' | 'third'
  text: string
  messageId: string
  parentMessageId?: string
  // 不同的message存放数据的地方
  extra?: {
    [key: string]: any
  }
}

// 用户发送的消息
export interface IUserSendMessage extends IChatMessage {
  type: 'user'
  text: string
  messageId: string
  parentMessageId?: string
  extra: {
    // 告诉Use ChatGPT API是否包含历史消息
    includeHistory?: boolean
    // 告诉Provider是否需要重新生成
    regenerate?: boolean
    // 告诉Provider最大的历史消息数量
    maxHistoryMessageCnt?: number
  }
}
export type IUserSendMessageExtraType = IUserSendMessage['extra']

// AI返回的消息
export interface IAIResponseMessage extends IChatMessage {
  type: 'ai'
  text: string
  messageId: string
  parentMessageId?: string
}

// 系统消息
export interface ISystemMessage extends IChatMessage {
  type: 'system'
  text: string
  messageId: string
  parentMessageId?: string
  extra: {
    status?: 'error' | 'success'
  }
}

// 第三方消息
export interface IThirdMessage extends IChatMessage {
  type: 'third'
  text: string
  messageId: string
  parentMessageId?: string
}
