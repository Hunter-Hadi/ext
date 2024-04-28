import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import { findSelectorParent } from '@/utils/dataHelper/elementHelper'
import { findLongestCommonSubstring } from '@/features/shortcuts/utils/chatApp/utils'

type IMessengerMediaType = 'Image' | 'GIF' | 'Video' | 'Document' | 'Sticker'
type IMessengerChatMessageData = IChatMessageData & {
  mediaType?: IMessengerMediaType
}

const messengerGetEmoji = (emojiBox: HTMLElement | null) => {
  if (emojiBox?.tagName !== 'IMG') {
    emojiBox = emojiBox!.querySelector('img')
  }
  if (emojiBox) {
    const emoji = emojiBox.getAttribute('alt') || ''
    if (/\p{Emoji}/u.test(emoji)) {
      return emoji
    }
  }
  return ''
}

const messengerGetMessageContent = (messageContentBox: HTMLElement | null) => {
  let messageContent = ''
  if (messageContentBox) {
    messageContentBox.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        messageContent += node.textContent
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        messageContent += messengerGetEmoji(node as HTMLElement)
      }
    })
  }
  return messageContent
}

const messengerGetChatMessagesFromNodeList = (
  messageBoxList: HTMLElement[],
  myUsername: string,
) => {
  const messages: IMessengerChatMessageData[] = []
  for (const messageBox of messageBoxList) {
    try {
      const messageData: IMessengerChatMessageData = {
        user: '',
        datetime: '',
        content: '',
      }
      const messageGridCellsBox = messageBox.querySelector<HTMLElement>(
        '[data-scope="messages_table"][role] [role] > [role] + [role="none"]',
      )
      const usernameBox = messageBox.querySelector<HTMLElement>(
        `[data-scope="messages_table"][role] > [role="presentation"] h4[dir] > span, 
        [data-scope="messages_table"][role] > span, 
        [data-scope="messages_table"][role] > [role="presentation"] h4 span[dir]:has(> span > span)`,
      )
      if (
        messageGridCellsBox &&
        getComputedStyle(messageGridCellsBox).flexDirection === 'row-reverse'
      ) {
        messageData.user = myUsername
      }
      if (usernameBox && !messageData.user) {
        messageData.user = usernameBox.textContent || 'Anonymous'
      } else if (!usernameBox) {
        const replyToBox = messageBox.querySelector<HTMLElement>(
          '[data-scope="messages_table"][role] > [role="presentation"] h4[dir] span',
        )
        if (replyToBox) {
          if (!messageData.user) {
            const avatar = messageBox.querySelector(
              '[role="presentation"] [aria-hidden] span > img[alt]',
            )
            messageData.user =
              findLongestCommonSubstring(
                avatar?.getAttribute('alt') || '',
                replyToBox.textContent || '',
              ) || 'Anonymous'
          }
          messageData.extraLabel = `this message is that ${
            replyToBox.textContent || ''
          }`
        }
      }
      const messageBubble = messageGridCellsBox?.querySelector<HTMLElement>(
        '& > [role="presentation"]:nth-child(1)',
      )
      if (messageBubble) {
        const messageContent =
          messageBubble.querySelector<HTMLElement>('span[dir] > div[dir]') ||
          messageBubble.querySelector<HTMLElement>('span[dir]')

        const isDocumentMessageBubble = Boolean(
          messageBubble.querySelector(
            `[download]:has(path[d="M18 8c0-.6-.4-1-1-1h-6a2 2 0 00-2 2v18c0 1.1.9 2 2 2h14a2 2 0 002-2V17c0-.6-.4-1-1-1h-4a4 4 0 01-4-4V8zm-6 7c0-.6.4-1 1-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm1 3.5a1 1 0 100 2h10a1 1 0 100-2H13zm0 4.5a1 1 0 100 2h10a1 1 0 100-2H13z"])`,
          ),
        )

        const isVoiceMessageBubble = Boolean(
          messageBubble.querySelector(
            '[role="button"][tabindex][aria-label]:has(path[d="M10 25.5v-15a1.5 1.5 0 012.17-1.34l15 7.5a1.5 1.5 0 010 2.68l-15 7.5A1.5 1.5 0 0110 25.5z"])',
          ),
        )

        // 发送 Document, Images, Video, GIF 的时候都不能附带文字
        // Document 的 case 下，messageContent 应该是文件名
        if (isDocumentMessageBubble) {
          messageData.extraLabel = `${
            messageData.extraLabel ? `${messageData.extraLabel}\n` : ''
          }this message sent a document: ${messageContent?.innerText || ''}`
          messageData.content = 'Attachment'
          messageData.mediaType = 'Document'
        }
        // Voice Message
        else if (isVoiceMessageBubble) {
          messageData.extraLabel = `${
            messageData.extraLabel ? `${messageData.extraLabel}\n` : ''
          }this message sent a Voice Message`
          messageData.content = 'Attachment'
          messageData.mediaType = 'Document'
        } else if (!messageContent) {
          const messageVideo = messageBubble.querySelector<HTMLElement>('video')
          const messageImages = Array.from(
            messageBubble.querySelectorAll<HTMLElement>('img'),
          )
          const messageSticker = messageBubble.querySelector<HTMLElement>(
            '[role="img"][aria-label]',
          )

          if (messageImages.length > 0) {
            const firstImageURL = new URL(messageImages[0].getAttribute('src')!)
            const emoji = messengerGetEmoji(messageImages[0])
            // GIF
            if (firstImageURL.pathname.toLocaleLowerCase().endsWith('.gif')) {
              messageData.mediaType = 'GIF'
              messageData.extraLabel = `${
                messageData.extraLabel ? `${messageData.extraLabel}\n` : ''
              }this message sent a ${messageData.mediaType}`
              messageData.content = messageData.mediaType
            }
            // maybe Emoji
            else if (emoji) {
              messageData.content = emoji
            }
            // Image，可能一张，可能多张
            else {
              messageData.mediaType = 'Image'
              messageData.extraLabel = `${
                messageData.extraLabel ? `${messageData.extraLabel}\n` : ''
              }this message sent ${
                messageImages.length === 1
                  ? 'an Image'
                  : `${messageImages.length} Images`
              }`
              messageData.content = messageData.mediaType
            }
          }
          // Video
          else if (messageVideo) {
            messageData.mediaType = 'Video'
            messageData.extraLabel = `${
              messageData.extraLabel ? `${messageData.extraLabel}\n` : ''
            }this message sent a ${messageData.mediaType}`
            messageData.content = messageData.mediaType
          }
          // Sticker
          else if (messageSticker) {
            messageData.mediaType = 'Sticker'
            messageData.extraLabel = `${
              messageData.extraLabel ? `${messageData.extraLabel}\n` : ''
            }this message sent a ${messageData.mediaType}:${
              messageSticker.getAttribute('aria-label') || ''
            }`
            messageData.content = messageData.mediaType
          }
        } else {
          messageData.content = messengerGetMessageContent(messageContent)
        }
      }
      // it means this message is a unsent message
      if (!messageData.content && !messageData.mediaType) {
        continue
      }
      messages.push(messageData)
    } catch (err) {
      console.error(err)
    }
  }
  return messages
}

export const messengerGetChatMessages = (inputAssistantButton: HTMLElement) => {
  // [role="main"] [role][aria-label][tabindex]:has(> span) h1 > span
  const chatroomName =
    document
      .querySelector<HTMLElement>('[role="main"]')
      ?.getAttribute('aria-label') || ''
  const myUsername =
    document
      .querySelector<HTMLElement>(
        '[role="button"][aria-label] svg[role="img"][aria-label]',
      )
      ?.getAttribute('aria-label') || 'Me'

  const configs = {
    serverName: `${myUsername} in Messenger`,
    chatroomName,
    username: myUsername,
  }

  const chatMessagesNodeList = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[role="main"] [role="grid"][aria-label] div[class]:has(+ [role="gridcell"])',
    ),
  )

  if (chatMessagesNodeList.length) {
    const chatMessages = messengerGetChatMessagesFromNodeList(
      chatMessagesNodeList,
      configs.username,
    )

    const chatTextArea = findSelectorParent(
      '[role="main"] [role="group"][aria-label] [id] + div div:has(div > [role="textbox"][contenteditable][aria-label][data-lexical-editor])',
      inputAssistantButton,
      3,
    )
    const quotedMention = findSelectorParent(
      'div:has(+ [role="button"][tabindex][aria-label] > i)',
      chatTextArea,
      5,
    )

    let replyUnfoundQuotedMessage: IMessengerChatMessageData | null = null
    let replyMessageBoxIndex = -1

    if (chatTextArea) {
      if (quotedMention) {
        let [quotedMessageUserBox, quotedMessageContentBox] = Array.from(
          quotedMention.querySelectorAll<HTMLElement>('span[dir]'),
        )
        if (quotedMessageUserBox && quotedMessageContentBox) {
          const quotedMessageUser =
            quotedMessageUserBox.querySelector<HTMLElement>('& > span')
              ?.textContent || configs.username
          if (quotedMessageContentBox.querySelector<HTMLElement>('[dir]')) {
            quotedMessageContentBox =
              quotedMessageContentBox.querySelector<HTMLElement>('[dir]')!
          }
          const quotedMessageContent = messengerGetMessageContent(
            quotedMessageContentBox,
          ).replace(/…$/, '')
          replyMessageBoxIndex = chatMessages.findLastIndex((message) => {
            // because a quoted message with attached media can't be exactly matched, so just ignore it
            if (message.mediaType) {
              return false
            }

            return (
              message.user === quotedMessageUser &&
              (message.content.length === quotedMessageContent.length
                ? message.content === quotedMessageContent
                : message.content.startsWith(quotedMessageContent))
            )
          })
          if (replyMessageBoxIndex === -1) {
            replyMessageBoxIndex = Infinity
            replyUnfoundQuotedMessage = {
              user: quotedMessageUser,
              content: quotedMessageContent,
              datetime: '',
            }
          }
        }
      } else {
        replyMessageBoxIndex = chatMessages.findLastIndex(
          (message) => message.user !== configs.username,
        )
      }
    }

    if (chatMessages.length) {
      if (replyMessageBoxIndex === Infinity) {
        if (replyUnfoundQuotedMessage) {
          const chatMessagesContext = new ChatMessagesContext(
            chatMessages,
            configs,
          )
          chatMessagesContext.replyMessage(replyUnfoundQuotedMessage)
          return chatMessagesContext.data
        }
      } else {
        const chatMessagesContext = new ChatMessagesContext(
          replyMessageBoxIndex !== -1
            ? chatMessages.slice(0, replyMessageBoxIndex + 1)
            : chatMessages,
          configs,
        )
        chatMessagesContext.replyMessage(replyMessageBoxIndex)
        return chatMessagesContext.data
      }
    }
  }

  return ChatMessagesContext.emptyData
}

export const messengerGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const messengerDraftEditor = findSelectorParent(
    'div > [role="textbox"][contenteditable][aria-label][data-lexical-editor]',
    inputAssistantButton,
    2,
  )
  return messengerDraftEditor?.innerText || ''
}
