// 基础的聊天消息类型
import { TFunction } from 'i18next'
import React from 'react'

import { IContextMenuIconKey } from '@/components/ContextMenuIcon'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { IUserRoleType } from '@/features/auth/types'
import { IContextMenuItem } from '@/features/contextMenu/types'

export interface IChatMessage {
  type: 'user' | 'ai' | 'system' | 'third'
  text: string
  messageId: string
  parentMessageId?: string
  // 不同的message存放数据的地方
  meta?: {
    [key: string]: any
  }
}

export interface IAskChatGPTActionQuestionType
  extends Omit<IUserChatMessage, 'type' | 'messageId' | 'conversationId'> {
  type?: 'user'
  messageId?: string
  conversationId?: string
}

// 用户发送的消息
export interface IUserChatMessage extends IChatMessage {
  type: 'user'
  text: string
  messageId: string
  conversationId: string
  parentMessageId?: string
  meta?: IChatMessageExtraMetaType
}

export type IChatMessageExtraMetaType = {
  // 是否自动判断AIResponseLanguage
  isEnabledDetectAIResponseLanguage?: boolean
  contextMenu?: IContextMenuItem
  // 温度
  temperature?: number
  // 附件
  attachments?: IChatUploadFile[]
  // 本条消息的显示消息
  messageVisibleText?: string
  // 搜索的消息源Json
  searchSources?: string
  // 是否包含历史消息
  includeHistory?: boolean
  // 聊天记录
  historyMessages?: Array<IAIResponseMessage | IUserChatMessage>
  // 输出的消息ID, 例如summary, search with AI
  outputMessageId?: string
  // 告诉Provider是否需要重新生成
  regenerate?: boolean
  [key: string]: any
}

export type IUserChatMessageExtraType = IUserChatMessage['meta']

export type IAIResponseOriginalMessageCopilotStep = {
  status: 'loading' | 'complete'
  title: string
  icon: IContextMenuIconKey
  valueType?: 'text' | 'tags' | 'list' | 'table' | 'image' | 'link'
  value?: string | string[] | Record<string, any>
}

export type IAIResponseOriginalMessageSourceLink = {
  title: string
  url: string
  favicon: string
  img: string
  from?: string
}

export type IAIResponseOriginalMessageMetadataTitle = {
  title: string
  titleIcon?: string
  titleIconSize?: number
}

export interface IAIResponseOriginalMessage {
  id?: string
  create_time?: string
  update_time?: string
  author?: {
    role: string
    name: string
    metadata?: string
  }
  content?: {
    title?: IAIResponseOriginalMessageMetadataTitle
    contentType: 'text'
    text: string
    language?: string
    images?: string[]
  }
  metadata?: {
    includeHistory?: boolean
    isComplete?: boolean
    finish?: {
      type: string
      stopTokens?: number
    }
    title?: IAIResponseOriginalMessageMetadataTitle
    // 来源于哪个网站
    sourceWebpage?: {
      title?: string
      url?: string
      favicon?: string
    }
    sources?: {
      status: 'loading' | 'complete'
      links?: IAIResponseOriginalMessageSourceLink[]
    }
    copilot?: {
      title?: IAIResponseOriginalMessageMetadataTitle
      steps: IAIResponseOriginalMessageCopilotStep[]
    }
    // summary底下的最后一句
    deepDive?: {
      title?: IAIResponseOriginalMessageMetadataTitle
      value: string
    }
    // 分享的类型, 用作在copy和share的时候
    shareType?: 'normal' | 'summary' | 'search'
    // TODO
    related?: string[]
  }
}
// AI返回的消息
export interface IAIResponseMessage extends IChatMessage {
  type: 'ai'
  text: string
  messageId: string
  parentMessageId?: string
  originalMessage?: IAIResponseOriginalMessage
}

// 系统消息
export interface ISystemChatMessage extends IChatMessage {
  type: 'system'
  text: string
  messageId: string
  parentMessageId?: string
  meta: {
    status?: 'error' | 'success' | 'info'
    systemMessageType?: 'needUpgrade' | 'normal'
    permissionSceneType?: PermissionWrapperCardSceneType
  }
  /**
   * @deprecated
   * @description - 后面用meta字段
   */
  extra?: {
    status?: 'error' | 'success' | 'info'
    systemMessageType?: 'needUpgrade' | 'normal'
    permissionSceneType?: PermissionWrapperCardSceneType
  }
}

// 第三方消息
export interface IThirdChatMessage extends IChatMessage {
  type: 'third'
  text: string
  messageId: string
  parentMessageId?: string
}

export interface IChatUploadFile {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  blobUrl?: string
  icon?: string
  file?: File
  base64Data?: string
  uploadProgress?: number
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error'
  uploadErrorMessage?: string
  uploadedUrl?: string
  uploadedFileId?: string
}

export type IAIProviderModelDescriptionType = {
  label: (t: TFunction<['common', 'client']>) => React.ReactNode
  value: (t: TFunction<['common', 'client']>) => React.ReactNode
}

export interface IAIProviderModel {
  title: string
  titleTag: string
  value: string
  tags: string[]
  maxTokens: number
  descriptions: IAIProviderModelDescriptionType[]
  disabled?: boolean
  uploadFileConfig?: {
    accept: string
    acceptTooltip: (t: TFunction<['common', 'client']>) => React.ReactNode
    maxFileSize: number
    maxCount: number
  }
  permission?: {
    sceneType: PermissionWrapperCardSceneType
    roles: IUserRoleType[]
  }
}
