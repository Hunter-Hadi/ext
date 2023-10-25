// 基础的聊天消息类型
import { IContextMenuItem } from '@/features/contextMenu/types'
import { TFunction } from 'i18next'
import React from 'react'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { IUserRoleType } from '@/features/auth/types'
import { IContextMenuIconKey } from '@/components/ContextMenuIcon'

export interface IChatMessage {
  type: 'user' | 'ai' | 'system' | 'third'
  text: string
  messageId: string
  // 本条消息是否展示
  messageVisible?: boolean
  parentMessageId?: string
  // 不同的message存放数据的地方
  extra?: {
    [key: string]: any
  }
}

// 用户发送的消息
export interface IUserChatMessage extends IChatMessage {
  type: 'user'
  text: string
  messageId: string
  parentMessageId?: string
  extra: {
    // 告诉Use ChatGPT API是否包含历史消息
    includeHistory?: boolean
    // 告诉Provider是否需要重试
    retry?: boolean
    // 告诉Provider是否需要重新生成
    regenerate?: boolean
    // 告诉Provider最大的历史消息数量
    maxHistoryMessageCnt?: number
    // 额外数据
    meta?: IChatMessageExtraMetaType
    // 聊天记录
    historyMessages?: Array<IAIResponseMessage | IUserChatMessage>
  }
}

export type IChatMessageExtraMetaType = {
  contextMenu?: IContextMenuItem
  // 温度
  temperature?: number
  // 附件
  attachments?: IChatUploadFile[]
  // 本条消息的显示消息
  messageVisibleText?: string
  // 搜索的消息源Json
  searchSources?: string
  [key: string]: any
}

export type IUserChatMessageExtraType = IUserChatMessage['extra']

export type IAIResponseOriginalMessageCopilotStep = {
  status: 'loading' | 'complete'
  title: string
  icon: IContextMenuIconKey
  value?: string | string[] | Record<string, any>
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
    finish?: {
      type: string
      stopTokens?: number
    }
    isComplete?: boolean
    title?: IAIResponseOriginalMessageMetadataTitle
    // 来源于哪个网站
    sourceWebpage?: {
      title?: string
      url?: string
      favicon?: string
    }
    sources?: {
      status: 'loading' | 'complete'
      links?: Array<{
        title: string
        url: string
        favicon: string
        img: string
        from?: string
      }>
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
  include_history?: boolean
  status?: string
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
  extra: {
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
