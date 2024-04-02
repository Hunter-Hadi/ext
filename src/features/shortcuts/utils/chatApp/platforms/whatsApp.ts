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
    const isOthersReply =
      quotedMessage.querySelector<HTMLElement>('[testid="author"]')
    if (isOthersReply) {
      user = isOthersReply?.innerText || ''
    }
    content =
      quotedMessage.querySelector<HTMLElement>('.quoted-mention')?.innerText ||
      ''
  }
  return { user, content }
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
    const message = messageBox.querySelector<HTMLElement>(
      '[data-pre-plain-text]',
    )

    if (message) {
      const match = message
        .getAttribute('data-pre-plain-text')
        ?.match(getDatetimeAndUserRegExp)

      if (match) {
        const [, datetime, username] = match

        if (
          !configs.username &&
          messageBox.getAttribute('data-id')?.includes('true') // if includes 'true', it means this message was sent by `me`
        ) {
          configs.username = username
          configs.serverName = `${username} in WhatsApp`
        }

        const messageData: IChatMessageData = {
          user: username,
          datetime,
          content:
            message.querySelector<HTMLElement>('.copyable-text')?.innerText ||
            '',
        }

        const quotedMention =
          message.querySelector<HTMLElement>('.quoted-mention')

        if (quotedMention) {
          const quotedMessage = whatsAppGetDataFromQuotedMessage(
            findParentEqualSelector(
              '[aria-label]',
              quotedMention.parentElement!,
            ),
          )
          messageData.extraLabel = `${username} is replying to ${
            quotedMessage.user || configs.username
          }'s message content: ${quotedMessage.content}`
        }

        messages.push(messageData)
      }
    }
  }
  return messages
}

export const whatsAppGetChatMessages = (inputAssistantButton: HTMLElement) => {
  const chatroomName =
    document.querySelector<HTMLElement>(
      'header > [title="Profile Details"] + [role="button"] [aria-label]:not([title])',
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

    if (channelTextArea && quotedMention) {
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
    }
    // else {
    // }
    // } else {
    // }

    if (chatMessages.length) {
      // const chatMessagesContext = new ChatMessagesContext(chatMessages, configs)
      // chatMessagesContext.replyMessage(
      //   chatMessages.findLastIndex((message) => message.user !== username),
      // )
      // return chatMessagesContext.data
    }
  }

  return ChatMessagesContext.emptyData
}

export const whatsAppGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const slackDraftEditor = findSelectorParent(
    'footer [role="textbox"][data-lexical-editor][contenteditable="true"]',
    inputAssistantButton,
    5,
  )
  return slackDraftEditor?.innerText || ''
}
