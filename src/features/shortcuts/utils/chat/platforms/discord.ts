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

const discordGetChatMessagesFromNodeList = (
  messageBoxList: HTMLElement[],
): IChatMessageData[] => {
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

  const chatMessagesNodeList = Array.from(
    chatMessagesPanel?.querySelectorAll<HTMLElement>(
      '[id^="chat-messages"]:not([class^="container"])',
    ) || [],
  )

  debugger

  if (chatMessagesNodeList.length) {
    const channelTextArea = findParentEqualSelector(
      '[class^="channelTextArea"]',
      inputAssistantButton,
      6,
    )

    let replyMessageBox: HTMLElement | null = null

    if (
      channelTextArea &&
      channelTextArea.querySelector<HTMLElement>('[class^="replyBar"]')
    ) {
      replyMessageBox = chatMessagesPanel.querySelector<HTMLElement>(
        '[id^="chat-messages"]:has(> [class*="replying"])',
      )
    } else {
      replyMessageBox = findParentEqualSelector(
        '[id^="chat-messages"]',
        inputAssistantButton,
      )
    }

    const chatMessages = discordGetChatMessagesFromNodeList(
      chatMessagesNodeList.slice(
        0,
        chatMessagesNodeList.findIndex(
          (messageBox) => messageBox === replyMessageBox,
        ) + 1,
      ),
    )

    if (chatMessages.length) {
      const chatMessagesContext = new ChatMessagesContext(chatMessages, {
        serverName: serverName || '',
        chatroomName: chatroomName || '',
        username: username || '',
      })

      chatMessagesContext.replyMessage(
        chatMessages.findLastIndex((message) => message.user !== username),
      )

      return chatMessagesContext.data
    }
  }

  // const chatMessages = discordGetChatMessagesFromNodeList(
  //   Array.from(
  //     chatMessagesPanel?.querySelectorAll<HTMLElement>(
  //       '[id^="chat-messages"]:not([class^="container"])',
  //     ) || [],
  //   ),
  // )

  // if (chatMessages.length) {
  //   const chatMessagesContext = new ChatMessagesContext(chatMessages, {
  //     serverName: serverName || '',
  //     chatroomName: chatroomName || '',
  //     username: username || '',
  //   })

  //   let replyMessage: ReturnType<
  //     typeof discordGetChatMessageContentAndDate
  //   > | null = null

  //   const channelTextArea = findParentEqualSelector(
  //     '[class^="channelTextArea"]',
  //     inputAssistantButton,
  //     6,
  //   )

  //   if (
  //     channelTextArea &&
  //     channelTextArea.querySelector<HTMLElement>('[class^="replyBar"]')
  //   ) {
  //     replyMessage = discordGetChatMessageContentAndDate(
  //       chatMessagesPanel.querySelector<HTMLElement>(
  //         '[id^="chat-messages"]:has(> [class*="replying"])',
  //       ),
  //     )
  //   } else {
  //     replyMessage = discordGetChatMessageContentAndDate(
  //       findParentEqualSelector('[id^="chat-messages"]', inputAssistantButton),
  //     )
  //   }

  //   chatMessagesContext.replyMessage(
  //     replyMessage?.datetime && replyMessage?.messageContent
  //       ? chatMessages.findIndex(
  //           (message) =>
  //             message.datetime === replyMessage!.datetime &&
  //             message.content === replyMessage!.messageContent,
  //         )
  //       : chatMessages.findLastIndex((message) => message.user !== username),
  //   )

  //   return chatMessagesContext.data
  // }

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
