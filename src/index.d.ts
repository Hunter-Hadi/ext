type ValueOf<T> = T[keyof T]

declare module '*.less' {
  const value: string
  export default value
}

export { IChromeExtensionDBStorageUpdateFunction } from '@/background/utils'
export { IChromeExtensionDBStorage } from '@/background/utils'
export { IChromeExtensionButtonSettingKey } from '@/background/utils'
export { IChatGPTPluginType } from '@/background/utils'
export { IChatGPTModelType } from '@/background/utils'
export { IPaginationConversation } from '@/features/indexed_db/conversations/models/Conversation'
export { IConversationMeta } from '@/features/indexed_db/conversations/models/Conversation'
export { IConversationShareConfig } from '@/features/indexed_db/conversations/models/Conversation'
export { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
