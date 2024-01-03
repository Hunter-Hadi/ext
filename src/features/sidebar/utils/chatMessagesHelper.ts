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
            // 添加标题
            if (
              originalMessage.metadata?.sourceWebpage?.title &&
              originalMessage.metadata.sourceWebpage.url
            ) {
              formatText =
                `${originalMessage.metadata.sourceWebpage.title}\n\n` +
                formatText
            }
            // 添加Sources
            if (originalMessage.metadata?.sourceWebpage?.url) {
              formatText = `${formatText}\n\nSource:\n${originalMessage.metadata.sourceWebpage.url}`
            }
            // 替换 ####Title => Title:
            formatText = formatText.replace(/####\s?([^\n]+)/g, '$1:')
            formatText += `\n\nPowered by MaxAI.me`
          }
          break
        case 'search':
          {
            // 添加Answer:\n
            formatText = `Answer:\n${formatText}`
            // 添加标题
            if (originalMessage.metadata?.title?.title) {
              const title = originalMessage.metadata.title.title
              formatText = `Question:\n${title}\n\n${formatText}`
            }
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
          // 添加标题
          if (originalMessage.metadata?.sourceWebpage?.title) {
            const title = originalMessage.metadata.sourceWebpage.title
            const titleElement = doc.createElement('h1')
            titleElement.innerText = title
            doc.body.prepend(titleElement)
          }
          // 添加标题Sources
          if (originalMessage.metadata?.sourceWebpage?.url) {
            const url = originalMessage.metadata.sourceWebpage.url
            const sourceElement = doc.createElement('h4')
            sourceElement.innerText = `Source:`
            const sourceUrlElement = doc.createElement('a')
            sourceUrlElement.href = url
            sourceUrlElement.target = '_blank'
            sourceUrlElement.innerText = url
            doc.body.appendChild(sourceElement)
            doc.body.appendChild(sourceUrlElement)
          }
          // 添加结尾
          const poweredByElement = doc.createElement('p')
          poweredByElement.innerText = 'Powered by MaxAI.me'
          doc.body.appendChild(poweredByElement)
        }
        break
      case 'search':
        {
          // 添加Answer标题
          const answerTitleElement = doc.createElement('h2')
          answerTitleElement.innerText = 'Answer:'
          doc.body.prepend(answerTitleElement)
          // 添加标题
          if (originalMessage.metadata?.title?.title) {
            const title = originalMessage.metadata.title.title
            const titleElement = doc.createElement('h2')
            titleElement.innerText = `Question:`
            const titleContentElement = doc.createElement('p')
            titleContentElement.innerText = title
            doc.body.prepend(titleContentElement)
            doc.body.prepend(titleElement)
          }
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
            const citationsElement = doc.createElement('h4')
            citationsElement.innerText = `Citations:`
            doc.body.appendChild(citationsElement)
            linksElements.forEach((linkElement) => {
              doc.body.appendChild(linkElement)
            })
          }
          // 添加结尾
          const poweredByElement = doc.createElement('p')
          poweredByElement.innerText = 'Powered by MaxAI.me'
          doc.body.appendChild(poweredByElement)
        }
        break
      default:
        break
    }
  }
  const html = doc.documentElement.outerHTML
  // inject to body
  const root = document.createElement('div')
  root.style.all = 'unset!important'
  root.style.position = 'absolute!important'
  root.style.top = '-9999px!important'
  root.style.left = '-9999px!important'
  root.style.zIndex = '-9999!important'
  root.style.width = '1px!important'
  root.style.height = '1px!important'
  root.style.overflow = 'hidden!important'
  root.style.userSelect = 'auto!important'
  root.innerHTML = html
  const container = document.body
  container.appendChild(root)
  // select
  const range = document.createRange()
  range.selectNode(root)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
  const text = ((root.innerText || root.textContent) ?? '').replace(
    /\n{2,}/g,
    '\n\n',
  )
  root.addEventListener(
    'copy',
    (e) => {
      const clipdata = e.clipboardData || (window as any).clipboardData
      clipdata.setData('text/plain', text)
      clipdata.setData('text/html', html)
      e.preventDefault()
      root.remove()
    },
    {
      capture: true,
      once: true,
    },
  )
  root.addEventListener(
    'copy',
    (e) => {
      const clipdata = e.clipboardData || (window as any).clipboardData
      clipdata.setData('text/plain', text)
      clipdata.setData('text/html', html)
      e.preventDefault()
      root.remove()
    },
    {
      once: true,
    },
  )
  // copy
  document.execCommand('copy')
  // remove
}
/**
 * 格式化用户消息的内容
 * @param message
 */
export const formatUserMessageContent = (message: IUserChatMessage) => {
  return message?.meta?.messageVisibleText || message.text
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
