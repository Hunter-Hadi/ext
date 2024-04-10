import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/ChatMessagesContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/features/shortcuts/utils/socialMedia/platforms/utils'

const getDatetimeAndUserRegExp = /^\[(.*?)\] (.*?): $/

const whatsAppGetDataFromQuotedMessage = (
  quotedMessage: HTMLElement | null,
) => {
  let user = ''
  let content = ''
  if (quotedMessage) {
    // if has testid, it means the reply target is not `me`
    // 24.04.10 update: the testid is not reliable
    // quotedMessage.querySelector<HTMLElement>('[testid="author"]')
    const isOthersReply = quotedMessage.querySelector<HTMLElement>(
      '[role]:has(+ div > .quoted-mention) > span:nth-child(1):not([aria-label])',
    )
    if (isOthersReply) {
      user = isOthersReply?.innerText || ''
    }
    content =
      quotedMessage.querySelector<HTMLElement>('.quoted-mention')?.innerText ||
      ''
  }
  return { user, content }
}

const whatsAppGetMessageData = (
  messageBox: HTMLElement,
  myUsername: string,
) => {
  const message = messageBox.querySelector<HTMLElement>('[data-pre-plain-text]')

  if (message) {
    const match = message
      .getAttribute('data-pre-plain-text')
      ?.match(getDatetimeAndUserRegExp)

    if (match) {
      const [, datetime, username] = match

      const messageData: IChatMessageData = {
        user: username,
        datetime,
        content:
          message.querySelector<HTMLElement>('.copyable-text')?.innerText || '',
      }

      const quotedMention =
        message.querySelector<HTMLElement>('.quoted-mention')

      if (quotedMention) {
        const quotedMessage = whatsAppGetDataFromQuotedMessage(
          findParentEqualSelector('[aria-label]', quotedMention.parentElement!),
        )
        messageData.extraLabel = `this message is replying to ${
          quotedMessage.user || myUsername
        }'s message: ${quotedMessage.content}`
      }

      return messageData
    }
  }

  return null
}

const whatsAppGetChatMessagesFromNodeList = (
  messageBoxList: HTMLElement[],
  configs: {
    serverName: string
    chatroomName: string
    username: string
  },
): IChatMessageData[] => {
  const messages: IChatMessageData[] = []

  for (const messageBox of messageBoxList) {
    const messageData = whatsAppGetMessageData(messageBox, configs.username)

    if (messageData) {
      if (
        !configs.username &&
        messageBox.getAttribute('data-id')?.includes('true') // if includes 'true', it means this message was sent by `me`
      ) {
        configs.username = messageData.user
        configs.serverName = `${messageData.user} in WhatsApp`
      }

      // if the chatroomName is the same as the username, it means it's a private chat
      if (configs.chatroomName === messageData.user) {
        configs.chatroomName = `Chatting with ${messageData.user}`
      }

      messages.push(messageData)
    }
  }
  return messages
}

export const whatsAppGetChatMessages = (inputAssistantButton: HTMLElement) => {
  const chatroomName =
    document.querySelector<HTMLElement>(
      '#main header > [title] + [role="button"] [aria-label]:not([title])',
    )?.innerText || ''
  const configs = {
    serverName: '',
    chatroomName,
    username: '',
  }

  const chatMessagesPanel = findSelectorParent(
    '#main [role="application"]',
    inputAssistantButton,
  )

  const chatMessagesNodeList = Array.from(
    chatMessagesPanel?.querySelectorAll<HTMLElement>(
      '[role="row"] > [data-id]:has(> [class*="message"])',
    ) || [],
  ).filter((node) => Boolean(node.querySelector('[data-pre-plain-text]')))

  if (chatMessagesNodeList.length) {
    const chatMessages = whatsAppGetChatMessagesFromNodeList(
      chatMessagesNodeList,
      configs,
    )
    const channelTextArea = findSelectorParent(
      'footer .copyable-area div:has(> div > button[aria-label] > [data-icon])',
      inputAssistantButton,
      5,
    )
    const quotedMention = findSelectorParent(
      '.quoted-mention',
      channelTextArea,
      5,
    )

    let replyMessageBoxIndex = -1

    if (channelTextArea) {
      if (quotedMention) {
        const quotedMessage = whatsAppGetDataFromQuotedMessage(
          findParentEqualSelector('[aria-label]', quotedMention.parentElement!),
        )
        if (!quotedMessage.user) {
          quotedMessage.user = configs.username
        }
        replyMessageBoxIndex = chatMessages.findLastIndex(
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
    // else {
    //   whatsAppGetMessageData()
    // }

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

export const whatsAppGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const whatsAppDraftEditor = findSelectorParent(
    'footer [role="textbox"][data-lexical-editor][contenteditable="true"]',
    inputAssistantButton,
    5,
  )
  return whatsAppDraftEditor?.innerText || ''
}
