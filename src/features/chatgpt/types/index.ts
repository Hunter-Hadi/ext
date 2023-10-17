// 基础的聊天消息类型
import { IContextMenuItem } from '@/features/contextMenu/types'
import { TFunction } from 'i18next'
import React from 'react'
import { PermissionWrapperCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { IUserRoleType } from '@/features/auth/types'

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
  attachments?: IChatUploadFile[]
  messageVisibleText?: string
  deleteMessageCount?: number
  [key: string]: any
}

export type IUserChatMessageExtraType = IUserChatMessage['extra']

// AI返回的消息
export interface IAIResponseMessage extends IChatMessage {
  type: 'ai'
  text: string
  messageId: string
  parentMessageId?: string
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
