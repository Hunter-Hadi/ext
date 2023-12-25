import sanitizeHtml from 'sanitize-html'
import sanitize from 'sanitize-html'

import { IChatConversation } from '@/background/src/chatConversations'
import { IAIResponseMessage, IUserChatMessage } from '@/features/chatgpt/types'
import {
  ISystemMessage,
  IThirdMessage,
} from '@/features/searchWithAI/chatCore/chatgpt/types'

/**
 * 格式化AI消息的内容
 * @param message
 */
export const formatAIMessageContent = (message: IAIResponseMessage) => {
  try {
    const originalMessage = message.originalMessage
    if (originalMessage) {
      const shareType = originalMessage?.metadata?.shareType || 'normal'
      let formatText = originalMessage?.content?.text || message.text
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
                `${originalMessage.metadata.sourceWebpage.title}\n\n` +
                formatText
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
  } catch (e) {
    return message.text
  }
}
export const formatAIMessageContentForClipboard = (
  message: IAIResponseMessage,
  element: HTMLElement,
) => {
  if (!element?.outerHTML) {
    return
  }
  const domParser = new DOMParser()
  const doc = domParser.parseFromString(
    sanitizeHtml(element.outerHTML, {
      disallowedTagsMode: 'recursiveEscape',
    } as sanitize.IOptions),
    'text/html',
  )
  const originalMessage = message?.originalMessage
  if (originalMessage) {
    const shareType = originalMessage?.metadata?.shareType || 'normal'
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
            const title = originalMessage.metadata.sourceWebpage.title
            const breakLine = doc.createElement('br')
            const url = originalMessage.metadata.sourceWebpage.url
            const titleElement = doc.createElement('h1')
            titleElement.innerText = title
            const urlElement = doc.createElement('p')
            urlElement.innerText = `Source:\n${url}`
            doc.body.prepend(urlElement)
            doc.body.prepend(breakLine)
            doc.body.prepend(titleElement)
          }
          // 添加结尾
          const breakLine = doc.createElement('br')
          const poweredByElement = doc.createElement('p')
          poweredByElement.innerText = 'Powered by MaxAI.me'
          doc.body.appendChild(breakLine)
          doc.body.appendChild(poweredByElement)
        }
        break
      case 'search':
        {
          // 添加引用
          const linksElements: HTMLElement[] = []
          if (originalMessage?.metadata?.sources?.links) {
            const links = originalMessage.metadata.sources.links
            if (links.length > 0) {
              links.forEach((link, index) => {
                const linkElement = doc.createElement('div')
                const linkIndexElement = doc.createElement('span')
                linkIndexElement.innerText = `[${index + 1}] `
                linkElement.appendChild(linkIndexElement)
                const linkUrlElement = doc.createElement('a')
                linkUrlElement.href = link.url
                linkUrlElement.target = '_blank'
                linkUrlElement.innerText = link.url
                linkElement.appendChild(linkUrlElement)
                linksElements.push(linkElement)
              })
            }
            const citationsElement = doc.createElement('p')
            citationsElement.innerText = `\n\nCitations:`
            doc.body.appendChild(citationsElement)
            linksElements.forEach((linkElement) => {
              doc.body.appendChild(linkElement)
            })
          }
          // 添加结尾
          const breakLine = doc.createElement('br')
          const poweredByElement = doc.createElement('p')
          poweredByElement.innerText = 'Powered by MaxAI.me'
          doc.body.appendChild(breakLine)
          doc.body.appendChild(poweredByElement)
        }
        break
      default:
        break
    }
  }
  const html = doc.documentElement.outerHTML
  const htmlBlob = new Blob([html], { type: 'text/html' })
  // inject to body
  const root = document.createElement('div')
  root.style.position = 'absolute'
  root.style.top = '-9999px'
  root.style.left = '-9999px'
  root.style.zIndex = '-9999'
  root.style.width = '1px'
  root.style.height = '1px'
  root.style.overflow = 'hidden'
  root.innerHTML = html
  document.body.appendChild(root)
  const text = ((root.innerText || root.textContent) ?? '').replace(
    /\n{2,}/g,
    '\n\n',
  )
  document.body.removeChild(root)
  const textBlob = new Blob([text], { type: 'text/plain' })
  const clipboardItem = new ClipboardItem({
    [htmlBlob.type]: htmlBlob,
    [textBlob.type]: textBlob,
  })
  navigator.clipboard.write([clipboardItem])
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
  const conversationType = conversation.type
  const liteHistory: string[] = []
  messages.forEach((message) => {
    if (message.type === 'ai') {
      const originalQuestion = (message as IAIResponseMessage).originalMessage
        ?.metadata?.title?.title
      if (originalQuestion && conversationType === 'Search') {
        liteHistory.push(originalQuestion)
      }
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
