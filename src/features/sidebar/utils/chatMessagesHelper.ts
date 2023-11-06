import { IAIResponseMessage, IUserChatMessage } from '@/features/chatgpt/types'
import {
  ISystemMessage,
  IThirdMessage,
} from '@/features/searchWithAI/chatCore/chatgpt/types'
import { IChatConversation } from '@/background/src/chatConversations'

/**
 * 格式化AI消息的内容
 * @param message
 */
export const formatAIMessageContent = (message: IAIResponseMessage) => {
  const originalMessage = message.originalMessage
  if (originalMessage) {
    const shareType = originalMessage.metadata?.shareType || 'normal'
    let formatText = message.originalMessage?.content?.text || message.text
    switch (shareType) {
      case 'normal':
        break
      case 'summary':
        {
          // 添加标题和结尾
          if (
            originalMessage.metadata?.sourceWebpage?.title &&
            originalMessage.metadata.sourceWebpage.url
          ) {
            formatText =
              `${originalMessage.metadata.sourceWebpage.title}\n\n` + formatText
            formatText = `${formatText}\n\nSource:\n${originalMessage.metadata.sourceWebpage.url}`
          }
          // 替换 ####Title => Title:
          formatText = formatText.replace(/####\s?([^\n]+)/g, '$1:')
          formatText += `\n\nPowered by MaxAI.me`
        }
        break
      case 'search':
        {
          if (originalMessage?.metadata?.sources?.links) {
            // 把长的引用链接变成短的: [[a](link)] => [a]
            formatText = formatText.replace(/\[\[(\d+)\]\([^)]+\)\]/g, '[$1]')
            const links = originalMessage.metadata.sources.links
            let citations = `\n\nCitations:`
            if (links.length > 0) {
              links.forEach((link, index) => {
                citations += `\n[${index + 1}] ${link.url}`
              })
            }
            formatText += citations
          }
          formatText += `\n\nPowered by MaxAI.me`
        }
        break
      default:
        break
    }
    return formatText
  } else {
    return message.text
  }
}
/**
 * 格式化用户消息的内容
 * @param message
 */
export const formatUserMessageContent = (message: IUserChatMessage) => {
  return message.extra.meta?.messageVisibleText || message.text
}
/**
 * 格式化第三方消息的内容
 * @param message
 */
export const formatThirdOrSystemMessageContent = (
  message: IThirdMessage | ISystemMessage,
) => {
  return message.text
}
/**
 * 格式化消息到文字版历史记录
 * @param conversation
 * @param needSystemOrThirdMessage 是否需要系统消息或第三方消息
 */
export const formatMessagesToLiteHistory = async (
  conversation: IChatConversation,
  needSystemOrThirdMessage: boolean,
): Promise<string> => {
  const title = conversation.title
  const messages = conversation.messages || []
  const liteHistory: string[] = []
  messages.forEach((message) => {
    if (message.type === 'ai') {
      liteHistory.push(
        'AI: ' + formatAIMessageContent(message as IAIResponseMessage),
      )
    } else if (message.type === 'user') {
      liteHistory.push(
        'User: ' + formatUserMessageContent(message as IUserChatMessage),
      )
    } else if (message.type === 'system' || message.type === 'third') {
      if (needSystemOrThirdMessage) {
        liteHistory.push(
          `${message.type === 'system' ? `System: ` : `Third: `}` +
            formatThirdOrSystemMessageContent(message as IThirdMessage),
        )
      }
    }
  })
  // 格式
  // ---------------------------------------------------------
  // Exploring Artificial Intelligence A Conversation with AI Assistant
  // ---------------------------------------------------------
  //
  //User: Hi there! How can you assist me today?
  //
  //AI: Hello! I'm an AI trained to help with a wide range of topics. Feel free to ask me anything or let me know what you need assistance with.
  return `---------------------------------------------------------\n${title} powered by MaxAI.me\n---------------------------------------------------------\n\n${liteHistory.join(
    '\n\n',
  )}`
}
