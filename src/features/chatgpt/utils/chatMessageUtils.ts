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
