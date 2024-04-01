import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/ChatMessagesContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/features/shortcuts/utils/socialMedia/platforms/utils'

const discordGetChatMessageContentAndDate = (
  messageBox: HTMLElement | null,
) => {
  const datetime =
    messageBox?.querySelector<HTMLElement>('time')?.getAttribute('datetime') ||
    ''
  let content = ''
  const messageContent = messageBox?.querySelector<HTMLElement>(
    ':not([id^="message-reply-context"]) > * > [id^="message-content"]',
  )
  if (messageContent) {
    content = messageContent?.innerText || ''
    // if message just only contains emojis
    if (!content) {
      const emojiContainers = Array.from(
        messageContent.querySelectorAll<HTMLElement>(
          '[clastt^="emojiContainer"]',
        ),
      )
      if (emojiContainers.length > 0) {
        content = emojiContainers
          .map((emojiContainer) =>
            emojiContainer.querySelector('img')?.getAttribute('aria-label'),
          )
          .join('')
      }
    }
  }
  return { datetime, messageContent: content }
}

const discordGetChatMessagesFromNodeList = (
  messageBoxList: HTMLElement[],
): IChatMessageData[] => {
  //   debugger
  const messages: IChatMessageData[] = []
  let username = ''
  for (const messageBox of messageBoxList) {
    // `welcome new user` notification is not a message
    // if (messageBox.querySelector('[class^="welcomeCTA"]')) {
    //   continue
    // }

    const usernameBlock = messageBox.querySelector<HTMLElement>(
      ':not([id^="message-reply-context"]) > [class^="username"]',
    )
    if (usernameBlock) {
      username = usernameBlock.innerText
    }

    // if doesn't have username, it means the data capture is not successful
    if (username) {
      const { datetime, messageContent } =
        discordGetChatMessageContentAndDate(messageBox)

      const message: IChatMessageData = {
        user: username,
        datetime,
        content: messageContent,
      }

      const extraLabel = messageBox.querySelector<HTMLElement>(
        '[id^="message-reply-context"]',
      )
      if (extraLabel) {
        message.extraLabel = `${extraLabel.getAttribute('aria-label')}:: ${
          extraLabel.innerText
        }`
      }
      messages.push(message)
    }
  }
  return messages
}

export const discordGetChatMessages = (inputAssistantButton: HTMLElement) => {
  const serverName = document.querySelector<HTMLElement>('header')?.innerText
  const chatroomName = document.querySelector<HTMLElement>(
    'li[class^="containerDefault"][class*="selected"]',
  )?.innerText
  const username = document.querySelector<HTMLElement>(
    '[class^="panelTitleContainer"]',
  )?.innerText

  const chatMessagesPanel = findSelectorParent(
    'ol[class^="scrollerInner"]',
    inputAssistantButton,
  )

  const chatMessages = discordGetChatMessagesFromNodeList(
    Array.from(
      chatMessagesPanel?.querySelectorAll<HTMLElement>(
        '[id^="chat-messages"]:not([class^="container"])',
      ) || [],
    ),
  )

  if (chatMessages.length) {
    const chatMessagesContext = new ChatMessagesContext(chatMessages, {
      serverName: serverName || '',
      chatroomName: chatroomName || '',
      username: username || '',
    })

    const channelTextArea = findParentEqualSelector(
      '[class^="channelTextArea"]',
      inputAssistantButton,
      6,
    )

    let replyMessage: ReturnType<
      typeof discordGetChatMessageContentAndDate
    > | null = null

    if (
      channelTextArea &&
      channelTextArea.querySelector<HTMLElement>('[class^="replyBar"]')
    ) {
      replyMessage = discordGetChatMessageContentAndDate(
        chatMessagesPanel.querySelector<HTMLElement>(
          '[id^="chat-messages"]:has(> [class*="replying"])',
        ),
      )
    } else {
      replyMessage = discordGetChatMessageContentAndDate(
        findParentEqualSelector('[id^="chat-messages"]', inputAssistantButton),
      )
    }

    chatMessagesContext.replyMessage(
      replyMessage?.datetime && replyMessage?.messageContent
        ? chatMessages.findIndex(
            (message) =>
              message.datetime === replyMessage!.datetime &&
              message.content === replyMessage!.messageContent,
          )
        : -1,
    )

    return chatMessagesContext.data
  }

  return ChatMessagesContext.emptyData
}

export const discordGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const discordDraftEditor = findSelectorParent(
    '[class^="channelTextArea"] [class^="textArea"] div[role="textbox"]',
    inputAssistantButton,
    5,
  )
  return discordDraftEditor?.innerText || ''
}
