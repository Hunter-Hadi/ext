import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

type ILinkedInChatMessageData = IChatMessageData & {
  attachment?: boolean
}

const linkedInGetChatMessagesFromGroupNodeList = (
  messageGroupList: HTMLElement[],
) => {
  const messages: ILinkedInChatMessageData[] = []
  let username = ''
  let datetime = ''
  for (const messageGroup of messageGroupList) {
    const messageGroupMeta = messageGroup.querySelector<HTMLElement>(
      '.msg-s-message-group__meta',
    )
    if (messageGroupMeta) {
      username =
        messageGroupMeta
          .querySelector('.msg-s-message-group__name')
          ?.textContent?.trim() || ''
      datetime =
        messageGroupMeta.querySelector('time')?.textContent?.trim() || ''
    }
    const messagesNodeList = Array.from(
      messageGroup?.querySelectorAll<HTMLElement>(
        '.msg-s-event-listitem__message-bubble',
      ) || [],
    )
    let replyToBox = messageGroup.querySelector(
      '.msg-s-event-listitem__replied-message-container',
    )

    for (const messageBox of messagesNodeList) {
      const isErrorMessage = Boolean(
        messageBox.querySelector('.msg-s-event-listitem__error-message'),
      )
      if (isErrorMessage) {
        continue
      }

      const message: ILinkedInChatMessageData = {
        user: username,
        datetime,
        content:
          messageBox
            .querySelector('.msg-s-event__content')
            ?.textContent?.trim() || '',
      }

      const isDocumentAttachment = messageBox.classList.contains(
        'msg-s-event-listitem__attachment-item',
      )

      if (isDocumentAttachment) {
        message.attachment = true
        const attachDocument = messageBox.querySelector(
          '.msg-s-event-listitem__download-attachment',
        )
        if (attachDocument) {
          const documentName =
            attachDocument
              .querySelector('.ui-attachment__filename')
              ?.textContent?.trim() || ''
          message.extraLabel = `this message sent a Document: ${documentName}`
          message.content ||= documentName
        } else if (messageBox.querySelector('img')) {
          message.extraLabel = 'this message sent an Image'
          message.content ||= 'Image'
        }
      } else if (replyToBox) {
        const [sender = 'Anonymous', ...messageFragments] =
          replyToBox
            .querySelector('.msg-s-event-listitem__replied-message-body-text')
            ?.textContent?.split(':') || []
        message.extraLabel = `this message is replying to ${sender}'s message: ${messageFragments.join(
          '',
        )}`
        replyToBox = null
      }

      messages.push(message)
    }
  }
  return messages
}

export const linkedInGetChatMessages = (inputAssistantButton: HTMLElement) => {
  const chatWindow =
    findParentEqualSelector('[id][role="dialog"]', inputAssistantButton, 8) ||
    findParentEqualSelector(
      '.msg-convo-wrapper[id][data-feedback-redacted]',
      inputAssistantButton,
      6,
    )

  if (chatWindow) {
    const username =
      document
        .querySelector('.global-nav__me img.global-nav__me-photo')
        ?.getAttribute('alt') || ''
    const chatroomName =
      chatWindow.querySelector<HTMLElement>(
        '.msg-overlay-bubble-header__title',
      ) ||
      chatWindow.querySelector<HTMLElement>(
        '.msg-entity-lockup__entity-title',
      ) ||
      'Anonymous'

    const chatMessageGroupsNodeList = Array.from(
      chatWindow.querySelectorAll<HTMLElement>(
        '.msg-s-message-list-container ul > li.msg-s-message-list__event',
      ) || [],
    )

    if (chatMessageGroupsNodeList.length) {
      const chatMessages = linkedInGetChatMessagesFromGroupNodeList(
        chatMessageGroupsNodeList,
      )
      const chatTextArea = chatWindow.querySelector<HTMLElement>(
        'form [role="textbox"][contenteditable="true"]',
      )
      let replyUnfoundQuotedMessage: ILinkedInChatMessageData | null = null
      let replyMessageBoxIndex = -1

      if (chatTextArea) {
        const quotedMention = findSelectorParent(
          '.msg-ui-thread-footer-feature__reply-to-message-text',
          chatTextArea,
          4,
        )
        if (quotedMention) {
          const quotedMessageReplyToUserText =
            quotedMention.querySelector('& > div:nth-child(1)')?.textContent ||
            'Anonymous'
          const quotedMessageContent =
            quotedMention
              .querySelector('& > div:nth-child(2)')
              ?.textContent?.replace(/\.\.\.$/, '') || ''
          replyMessageBoxIndex = chatMessages.findLastIndex((message) => {
            if (!message.attachment) {
              const usernameChunks = message.user.split(' ')
              if (
                usernameChunks.some((chunk) =>
                  quotedMessageReplyToUserText.includes(chunk),
                )
              ) {
                if (message.content.length === quotedMessageContent.length) {
                  return message.content === quotedMessageContent
                } else {
                  return message.content.startsWith(quotedMessageContent)
                }
              }
            }
            return false
          })

          // 找不到 quoted message，有可能是：
          // 1. 在聊天记录里面被虚拟列表刷走了
          // 2. 没获取到正确的 username 的 message
          // 3. 没被适配到的 quoted message
          if (replyMessageBoxIndex === -1) {
            replyMessageBoxIndex = Infinity
            replyUnfoundQuotedMessage = {
              user: quotedMessageReplyToUserText, // 在 i18n 的影响下不能确定哪个是正确的 username，直接全部放进去
              content: quotedMessageContent,
              datetime: '',
            }
          }
        } else {
          replyMessageBoxIndex = chatMessages.findLastIndex(
            (message) => message.user !== username,
          )
        }
      }

      if (chatMessages.length) {
        const configs = {
          serverName: `${username} in LinkedIn`,
          chatroomName: `Chatting with ${chatroomName}`,
          username,
        }
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
  }

  return ChatMessagesContext.emptyData
}

export const linkedInGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const linkedInDraftEditor = findSelectorParent(
    'form [role="textbox"][contenteditable="true"]',
    inputAssistantButton,
    5,
  )
  return linkedInDraftEditor?.innerText || ''
}
