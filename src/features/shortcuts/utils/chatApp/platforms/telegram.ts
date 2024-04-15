import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import { findSelectorParent } from '@/utils/dataHelper/elementHelper'

const telegramGetMessageData = (messageBox: HTMLElement) => {
  if (messageBox) {
    const username =
      messageBox.querySelector<HTMLElement>(
        '.bubble-content > .name[data-peer-id] > .peer-title[data-peer-id]',
      )?.textContent || ''

    const messageData: IChatMessageData = {
      user: username,
      datetime: '',
      content: '',
    }

    messageBox
      .querySelector<HTMLElement>('.message')
      ?.childNodes.forEach((node) => {
        if (node.nodeType === node.TEXT_NODE) {
          messageData.content = node.textContent || ''
        } else if ((node as HTMLElement).matches('.time')) {
          messageData.datetime =
            (node as HTMLElement)
              .querySelector('.time-inner')
              ?.getAttribute('title') || ''
        } else if ((node as HTMLElement).matches('.reply')) {
          messageData.extraLabel = `${username} is replying to ${
            (node as HTMLElement).querySelector<HTMLElement>(
              '.reply-title .peer-title[data-peer-id]',
            )?.innerText || ''
          }`
        }
      })

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
    const messageData = telegramGetMessageData(messageBox)

    if (messageData) {
      messageData.user ||= chattingWith
      messages.push(messageData)
    }
  }
  return messages
}

export const telegramGetChatMessages = (inputAssistantButton: HTMLElement) => {
  const serverName =
    document.querySelector<HTMLElement>(
      '.chat-info .content > .bottom > .info .peer-title[data-peer-id]',
    )?.innerText || ''
  const chatroomName =
    document.querySelector<HTMLElement>(
      '.chat-info .content > .top > .user-title > .peer-title[data-peer-id]',
    )?.innerText || ''

  const configs = {
    serverName,
    chatroomName,
    username: '', // Telegram can't get the username
  }

  const chatMessagesPanel = document.querySelector(
    '.bubbles .bubbles-date-group',
  )

  const chatMessagesNodeList = Array.from(
    chatMessagesPanel?.querySelectorAll<HTMLElement>(
      '.bubbles-group .bubble[data-peer-id]',
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
      '.is-helper-active .chat-input-main .reply-wrapper',
      chatTextArea,
      3,
    )
    let replyMessageBoxIndex = -1

    if (chatTextArea) {
      if (quotedMention) {
        //
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
