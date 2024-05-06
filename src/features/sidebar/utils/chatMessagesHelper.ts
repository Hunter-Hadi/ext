import { isArray } from 'lodash-es'
import sanitizeHtml from 'sanitize-html'
import sanitize from 'sanitize-html'

import { IChatConversation } from '@/background/src/chatConversations'
import {
  IAIResponseMessage,
  IChatMessage,
  ISystemChatMessage,
  IThirdChatMessage,
  IUserChatMessage,
} from '@/features/chatgpt/types'
import {
  isAIMessage,
  isSystemMessage,
  isUserMessage,
} from '@/features/chatgpt/utils/chatMessageUtils'
import { MAXAI_SIDEBAR_ID } from '@/features/common/constants'
import { TranscriptResponse } from '@/features/shortcuts/actions/web/ActionGetYoutubeTranscriptOfURL/YoutubeTranscript'
import { getOriginalFileURL } from '@/utils/dataHelper/websiteHelper'
export const formatSecondsAsTimestamp = (seconds: string) => {
  // 将字符串转换为浮点数并取整
  const totalSeconds = Math.round(parseFloat(seconds))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60)
  const sec = totalSeconds - hours * 3600 - minutes * 60

  // 使用padStart在个位数前添加0，格式化字符串为两位数
  const hoursString = hours.toString().padStart(2, '0')
  const minutesString = minutes.toString().padStart(2, '0')
  const secondsString = sec.toString().padStart(2, '0')
  if (hoursString !== '00') {
    return `${hoursString}:${minutesString}:${secondsString}`
  } else {
    return `${minutesString}:${secondsString}`
  }
}
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
            formatText =
              formatTimestampedSummaryAIMessageContent(message) || formatText //transcripts 数据 转为text
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
              formatText = `${formatText}\n\nSource:\n${getOriginalFileURL(
                originalMessage.metadata?.sourceWebpage?.url,
              )}`
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
        case 'art':
          {
            formatText =
              originalMessage.metadata?.artTextToImagePrompt ||
              originalMessage.metadata?.title?.title ||
              formatText
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
/**
 * summary transcript 主动生成 文本 格式
 * 因为 transcript 是 div 样式逻辑，所以需要转换为文本
 * @param message
 */
export const formatTimestampedSummaryAIMessageContent = (
  message: IAIResponseMessage,
) => {
  try {
    const decodeHtmlEntity = (str: string) => {
      const textarea = document.createElement('textarea')
      textarea.innerHTML = str.trim().replace(/\n/g, '')
      return textarea.value
    }
    if (
      message.originalMessage?.metadata?.title?.title ===
        'Timestamped summary' ||
      message.originalMessage?.metadata?.title?.title === 'Show transcript'
    ) {
      if (isArray(message.originalMessage?.metadata?.deepDive)) {
        const transcripts = message.originalMessage?.metadata?.deepDive?.filter(
          (item) =>
            item.type === 'timestampedSummary' || item.type === 'transcript',
        )?.[0]?.value
        if (isArray(transcripts)) {
          const markdownTexts = (transcripts as TranscriptResponse[])
            ?.filter((transcript) => transcript.text)
            .map((transcript) => {
              const firstStageText = `- ${
                formatSecondsAsTimestamp(transcript.start) || ''
              }: ${decodeHtmlEntity(transcript.text || '')}`
              const childrenText = transcript.children
                ?.filter((childrenTranscript) => childrenTranscript.text)
                .map(
                  (childrenTranscript) =>
                    `    - ${
                      formatSecondsAsTimestamp(childrenTranscript.start) || ''
                    }: ${decodeHtmlEntity(childrenTranscript.text || '')}`,
                )
                .join('\n')
              return `${firstStageText || ''}\n${childrenText || ''}`
            })
            .join('\n\n')
          return markdownTexts
        } else {
          return false
        }
      }
      return false
    } else {
      return false
    }
  } catch (e) {
    return false
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
          const transcriptFormatText =
            formatTimestampedSummaryAIMessageContent(message) //transcripts 数据 转为text
          if (transcriptFormatText) {
            const titleElement = doc.createElement('p')
            titleElement.innerText = transcriptFormatText
            doc.body.prepend(titleElement)
          }
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
            sourceUrlElement.innerText = getOriginalFileURL(url)
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
  return (
    message?.meta?.messageVisibleText ||
    message?.text ||
    message.meta?.contextMenu?.text ||
    ''
  ).trim()
}
/**
 * 格式化第三方消息的内容
 * @param message
 */
export const formatThirdOrSystemMessageContent = (
  message: IThirdChatMessage | ISystemChatMessage,
) => {
  return message.text.trim()
}

/**
 * 格式化Chat消息的内容
 * @param message
 */
export const formatChatMessageContent = (message: IChatMessage) => {
  if (isUserMessage(message)) {
    return formatUserMessageContent(message)
  } else if (isAIMessage(message)) {
    return formatAIMessageContent(message)
  } else {
    return formatThirdOrSystemMessageContent(message as ISystemChatMessage)
  }
}
export const safeGetAttachmentExtractedContent = (
  extractedContent: string | Record<string, any>,
) => {
  if (extractedContent) {
    if (typeof extractedContent !== 'string') {
      try {
        return JSON.stringify(extractedContent, null, 2)
      } catch (e) {
        return 'Content is not a string'
      }
    }
    return extractedContent
  }
  return ''
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
    if (isAIMessage(message)) {
      const originalQuestion = message.originalMessage?.metadata?.title?.title
      if (originalQuestion && conversationType === 'Search') {
        liteHistory.push(originalQuestion)
      }
      liteHistory.push('AI: ' + formatAIMessageContent(message))
    } else if (isUserMessage(message)) {
      const userMessage = message
      let userAttachmentText = ''
      if (userMessage.meta?.attachments?.length) {
        // 添加附件
        userAttachmentText = '\nAttachments:\n'
        for (const attachment of userMessage.meta.attachments) {
          userAttachmentText += `  • <${attachment.fileName}>\n`
        }
      }
      let userContextText = ''
      if (userMessage.meta?.contexts?.length) {
        // 添加上下文
        userContextText = '\nContexts:\n'
        for (const context of userMessage.meta.contexts) {
          userContextText += `  • ${context.key}: ${context.value}\n`
        }
      }
      liteHistory.push(
        'User: ' +
          formatUserMessageContent(userMessage) +
          '\n' +
          userAttachmentText +
          userContextText,
      )
    } else if (isSystemMessage(message) || message.type === 'third') {
      if (needSystemOrThirdMessage) {
        liteHistory.push(
          `${message.type === 'system' ? `System: ` : `Third: `}` +
            formatThirdOrSystemMessageContent(message as IThirdChatMessage),
        )
      }
    }
  })
  // 格式
  // ---------------------------------------------------------
  // Exploring Artificial Intelligence A Conversation with AI Assistant
  // ---------------------------------------------------------
  //
  //User contexts:
  //  • Selected text: Aucun texte sélectionné
  //  • Key points: Améliorer mes compétences en rédaction
  //User: Hi there! How can you assist me today?
  //
  //AI: Hello! I'm an AI trained to help with a wide range of topics. Feel free to ask me anything or let me know what you need assistance with.
  return `---------------------------------------------------------\n${title} powered by MaxAI.me\n---------------------------------------------------------\n\n${liteHistory.join(
    '\n\n',
  )}`
}

/**
 * 获取MaxAI Sidebar的Selection
 * @description - 因为MaxAI Sidebar是Shadow DOM, 所以需要通过这个方法获取Selection
 */
export const getMaxAISidebarSelection = () => {
  if (typeof window !== 'undefined') {
    const MaxAISidebarShadowRoot = document.querySelector(
      `#${MAXAI_SIDEBAR_ID}`,
    )?.shadowRoot
    if (MaxAISidebarShadowRoot) {
      return (MaxAISidebarShadowRoot as any).getSelection() as Selection
    }
  }
  return null
}
