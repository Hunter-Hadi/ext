import {
  IAIResponseMessage,
  IChatMessage,
  ISystemChatMessage,
  IUserChatMessage,
} from '@/features/chatgpt/types'

/**
 * 消息是否是AI消息
 * @param message
 */
export const isAIMessage = (
  message: IChatMessage,
): message is IAIResponseMessage => {
  return message.type === 'ai'
}
/**
 * 消息是否是用户消息
 * @param message
 */
export const isUserMessage = (
  message: IChatMessage,
): message is IUserChatMessage => {
  return message.type === 'user'
}
/**
 * 消息是否是系统消息
 * @param message
 */
export const isSystemMessage = (
  message: IChatMessage,
): message is ISystemChatMessage => {
  return message.type === 'system' || message.type === 'third'
}

/**
 * 消息是否是对应状态的系统消息
 * @param message
 * @param status
 */
export const isSystemMessageByStatus = (
  message: IChatMessage,
  status: ISystemChatMessage['meta']['status'],
): message is ISystemChatMessage => {
  return isSystemMessage(message) && message.meta.status === status
}

/**
 * 消息是否是对应类型的系统消息
 * @param message
 * @param type
 */
export const isSystemMessageByType = (
  message: IChatMessage,
  type: ISystemChatMessage['meta']['systemMessageType'],
) => {
  return isSystemMessage(message) && message.meta.systemMessageType === type
}

/**
 * 消息是否是增强型AI消息
 * @param message
 */
export const isRichAIMessage = (
  message: IChatMessage,
): message is IAIResponseMessage => {
  return (
    isAIMessage(message) &&
    message.originalMessage !== undefined &&
    !message.originalMessage.liteMode
  )
}
