import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

const discordGetChatMessageContentAndDate = (
  messageBox: HTMLElement | null,
) => {
  const datetime =
    messageBox?.querySelector<HTMLElement>('time')?.getAttribute('datetime') ||
    ''
  let content = ''
  if (messageBox) {
    const messageContentBox = messageBox.querySelector<HTMLElement>(
      ':not([id^="message-reply-context"]) > * > [id^="message-content"]',
    )
    const messageInlineEditTextBox = messageBox.querySelector<HTMLElement>(
      '[class^="channelTextArea"] [role="textbox"]',
    )
    const embedWrappers = Array.from(
      messageBox.querySelectorAll<HTMLElement>('[class^="embedWrapper"]') || [],
    )
    if (messageContentBox) {
      content = messageContentBox?.innerText || ''
      // if message just only contains emojis
      if (!content) {
        const emojiContainers = Array.from(
          messageContentBox.querySelectorAll<HTMLElement>(
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
    } else if (messageInlineEditTextBox) {
      content = messageInlineEditTextBox?.innerText || ''
    } else if (embedWrappers.length) {
      for (const embedWrapper of embedWrappers) {
        content += `${
          embedWrapper.querySelector<HTMLElement>('[class^="embedTitle"]')
            ?.innerText || ''
        }${
          embedWrapper.querySelector<HTMLElement>('[class^="embedDescription"]')
            ?.innerText || ''
        }\n`
      }
    }
  }
  return { datetime, messageContent: content }
}

const discordGetChatMessagesFromNodeList = (messageBoxList: HTMLElement[]) => {
  const messages: IChatMessageData[] = []
  let username = ''
  for (const messageBox of messageBoxList) {
    const usernameBlock = messageBox.querySelector<HTMLElement>(
      ':not([id^="message-reply-context"]) > [class^="username"]',
    )
    if (usernameBlock) {
      username = usernameBlock.innerText
    }

    // if doesn't have username, it means the data capture is not successful, need to relocate the usernameBlock selector
    if (username) {
      const { datetime, messageContent } =
        discordGetChatMessageContentAndDate(messageBox)

      const messageData: IChatMessageData = {
        user: username,
        datetime,
        content: messageContent,
      }

      const extraLabel = messageBox.querySelector<HTMLElement>(
        '[id^="message-reply-context"]',
      )
      if (extraLabel) {
        messageData.extraLabel = `${extraLabel.getAttribute('aria-label')}`
      }
      messages.push(messageData)
    }
  }
  return messages
}

export const discordGetChatMessages = (inputAssistantButton: HTMLElement) => {
  const serverName = document.querySelector<HTMLElement>('header')?.innerText
  const chatroomName = (
    document.querySelector<HTMLElement>(
      'li[class^="containerDefault"][class*="selected"]',
    ) || document.querySelector<HTMLElement>('h1[class*="title"]')
  )?.innerText
  const username = document.querySelector<HTMLElement>(
    '[class^="panelTitleContainer"]',
  )?.innerText

  const chatMessagesPanel = findSelectorParent(
    'ol[class^="scrollerInner"]',
    inputAssistantButton,
  )

  const chatMessagesNodeList = Array.from(
    chatMessagesPanel?.querySelectorAll<HTMLElement>(
      '[id^="chat-messages"]:not([class^="container"])',
    ) || [],
  )

  if (chatMessagesNodeList.length) {
    const chatMessages =
      discordGetChatMessagesFromNodeList(chatMessagesNodeList)

    const channelTextArea = findParentEqualSelector(
      '[class^="channelTextArea"]',
      inputAssistantButton,
      6,
    )

    let replyMessageBoxIndex = -1

    if (channelTextArea) {
      if (channelTextArea.querySelector<HTMLElement>('[class^="replyBar"]')) {
        replyMessageBoxIndex = chatMessagesNodeList.findLastIndex(
          (messageBox) =>
            messageBox.matches(
              '[id^="chat-messages"]:has(> [class*="replying"])',
            ),
        )
      } else {
        replyMessageBoxIndex = chatMessages.findLastIndex(
          (message) => message.user !== username,
        )
      }
    } else {
      const replyMessageBox = findParentEqualSelector(
        '[id^="chat-messages"]',
        inputAssistantButton,
        8,
      )
      replyMessageBoxIndex = chatMessagesNodeList.findLastIndex(
        (messageBox) => messageBox === replyMessageBox,
      )
    }

    if (chatMessages.length) {
      const chatMessagesContext = new ChatMessagesContext(
        replyMessageBoxIndex !== -1
          ? chatMessages.slice(0, replyMessageBoxIndex + 1)
          : chatMessages,
        {
          serverName: serverName || '',
          chatroomName: chatroomName || '',
          username: username || '',
        },
      )

      chatMessagesContext.replyMessage(replyMessageBoxIndex)

      return chatMessagesContext.data
    }
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
