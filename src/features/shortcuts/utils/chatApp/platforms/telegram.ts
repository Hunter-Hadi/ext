import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import { findSelectorParent } from '@/utils/dataHelper/elementHelper'

const telegramGetDataFromQuotedMessage = (
  quotedMessage: HTMLElement | null,
) => {
  let user = '',
    content = ''
  if (quotedMessage) {
    user =
      quotedMessage.querySelector<HTMLElement>(
        '.reply-title .peer-title[data-peer-id]',
      )?.innerText || ''
    content =
      quotedMessage.querySelector<HTMLElement>('.reply-subtitle')?.innerText ||
      ''
  }
  return { user, content }
}

const telegramGetMessageData = (messageBox: HTMLElement, username: string) => {
  if (messageBox) {
    username =
      messageBox.querySelector<HTMLElement>(
        '.bubble-content > .name[data-peer-id] .peer-title[data-peer-id]',
      )?.textContent || username

    const messageData: IChatMessageData = {
      user: username,
      datetime: '',
      content: '',
    }

    if (messageBox.matches('.sticker')) {
      messageData.extraLabel = `${username} sent a sticker`
      messageData.datetime =
        messageBox
          .querySelector<HTMLElement>('.message .time-inner')
          ?.getAttribute('title') || ''
    } else {
      messageBox
        .querySelector<HTMLElement>('.message')
        ?.childNodes.forEach((node) => {
          // content
          if (node.nodeType === node.TEXT_NODE) {
            messageData.content = node.textContent || ''
          }
          // datetime
          else if ((node as HTMLElement).matches('.time')) {
            messageData.datetime =
              (node as HTMLElement)
                .querySelector('.time-inner')
                ?.getAttribute('title') || ''
          }
          // replying to quoted message
          else if ((node as HTMLElement).matches('.reply')) {
            const quotedMessage = telegramGetDataFromQuotedMessage(
              node as HTMLElement,
            )
            messageData.extraLabel = `${username} is replying to ${quotedMessage.user}'s message: ${quotedMessage.content}`
          }
          // document
          else if ((node as HTMLElement).matches('.document-container')) {
            messageData.extraLabel = `${username} sent a document: ${
              (node as HTMLElement).querySelector('.document-name')
                ?.textContent || ''
            }`
            messageData.datetime =
              (node as HTMLElement)
                .querySelector('.time-inner')
                ?.getAttribute('title') || ''
          }
        })
    }

    return messageData
  }
  return null
}

const telegramGetChatMessagesFromNodeList = (
  messageBoxList: HTMLElement[],
  configs: {
    serverName: string
    chatroomName: string
    username: string
  },
): IChatMessageData[] => {
  let chattingWith = ''

  // if the serverName is empty, it means it's a private chat,
  // and the chatroomName is the username of the person being chatted with.
  if (!configs.serverName) {
    chattingWith = configs.chatroomName
    configs.serverName = 'Chat in Telegram'
    configs.chatroomName = `Chatting with ${chattingWith}`
  }

  const messages: IChatMessageData[] = []
  for (const messageBox of messageBoxList) {
    const messageData = telegramGetMessageData(
      messageBox,
      messageBox.matches('.is-out') ? configs.username : chattingWith,
    )

    if (messageData) {
      messages.push(messageData)
    }
  }
  return messages
}

export const telegramGetChatMessages = async (
  inputAssistantButton: HTMLElement,
) => {
  debugger
  const serverName =
    document.querySelector<HTMLElement>(
      '.chat-info .content > .bottom > .info .peer-title[data-peer-id]',
    )?.innerText || ''
  const chatroomName =
    document.querySelector<HTMLElement>(
      '.chat-info .content > .top > .user-title > .peer-title[data-peer-id]',
    )?.innerText || ''

  let temporarySpecialStyle: HTMLStyleElement | null = null
  if (
    !document.querySelector<HTMLElement>(
      '.settings-container.profile-container.active .sidebar-content .profile-content.is-me',
    )
  ) {
    temporarySpecialStyle = document.createElement('style')
    temporarySpecialStyle.innerHTML = `.tabs-container .sidebar-left .tabs-tab:not(.settings-container.profile-container){display:flex!important;transform:none!important;} .sidebar-header>.sidebar-header__btn-container button>.btn-menu{display:none!important;} .settings-container.profile-container{display:none!important;}`
    document.getElementsByTagName('head')[0].appendChild(temporarySpecialStyle)
    const menuButton = document.querySelector<HTMLElement>(
      '.sidebar-header > .sidebar-header__btn-container button:not(.menu-open)',
    )
    if (menuButton) {
      await new Promise<void>((resolve) => {
        new MutationObserver((mutations, observer) => {
          menuButton
            ?.querySelectorAll<HTMLElement>(
              '.btn-menu.was-open > .btn-menu-item',
            )
            .item(3)
            ?.click()
          observer.disconnect()
          resolve()
        }).observe(menuButton, {
          childList: true,
        })
        menuButton?.click()
      })
    }
  }

  const configs = {
    serverName,
    chatroomName,
    username:
      document.querySelector<HTMLElement>(
        '.settings-container.profile-container.active .sidebar-content .profile-content.is-me .profile-name .peer-title[data-peer-id]',
      )?.textContent || '',
  }

  if (temporarySpecialStyle) {
    document
      .querySelector<HTMLElement>(
        '.settings-container.profile-container.active .sidebar-header button.sidebar-close-button',
      )
      ?.click()
    temporarySpecialStyle?.remove()
  }

  const chatMessagesPanel = document.querySelector(
    '.bubbles .scrollable > .bubbles-inner',
  )

  const chatMessagesNodeList = Array.from(
    chatMessagesPanel?.querySelectorAll<HTMLElement>(
      '.bubbles-date-group .bubbles-group .bubble[data-peer-id]',
    ) || [],
  )

  if (chatMessagesNodeList.length) {
    const chatMessages = telegramGetChatMessagesFromNodeList(
      chatMessagesNodeList,
      configs,
    )

    const chatTextArea = findSelectorParent(
      '.input-message-input[data-peer-id]',
      inputAssistantButton,
      2,
    )
    const quotedMention = findSelectorParent(
      '.is-helper-active .chat-input-main .reply-wrapper .reply',
      chatTextArea,
      3,
    )
    let replyMessageBoxIndex = -1

    if (chatTextArea) {
      if (quotedMention) {
        const quotedMessage = telegramGetDataFromQuotedMessage(quotedMention)
        replyMessageBoxIndex = chatMessages.findIndex(
          (message) =>
            message.user === quotedMessage.user &&
            message.content === quotedMessage.content,
        )
      } else {
        replyMessageBoxIndex = chatMessages.findLastIndex(
          (message) => message.user !== configs.username,
        )
      }
    }

    if (chatMessages.length) {
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

  return ChatMessagesContext.emptyData
}

export const telegramGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const telegramDraftEditor = findSelectorParent(
    '.input-message-input[data-peer-id]',
    inputAssistantButton,
    2,
  )
  return telegramDraftEditor?.innerText || ''
}
