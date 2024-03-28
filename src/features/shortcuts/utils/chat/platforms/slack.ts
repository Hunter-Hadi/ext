import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/ChatMessagesContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/features/shortcuts/utils/socialMedia/platforms/utils'

const slackGetChatMessageContentAndDate = (messageBox: HTMLElement | null) => {
  const datetime =
    messageBox
      ?.querySelector<HTMLElement>('a[class*="c-timestamp"]')
      ?.getAttribute('aria-label') || ''
  let content = ''
  let extraLabel = ''

  if (messageBox) {
    const messageContentBox = messageBox.querySelector<HTMLElement>(
      '[data-qa="message-text"]',
    )
    if (messageContentBox) {
      content = messageContentBox?.innerText || ''

      // // if message just only contains emojis
      // if (!content) {
      //   const emojiContainers = Array.from(
      //     messageContentBox.querySelectorAll<HTMLElement>(
      //       '[clastt^="emojiContainer"]',
      //     ),
      //   )
      //   if (emojiContainers.length > 0) {
      //     content = emojiContainers
      //       .map((emojiContainer) =>
      //         emojiContainer.querySelector('img')?.getAttribute('aria-label'),
      //       )
      //       .join('')
      //   }
      // }
    }

    const extraLabelBox =
      messageBox.querySelector<HTMLElement>(
        '.c-message__broadcast_preamble_outer',
      ) || messageBox.querySelector<HTMLElement>('.c-message__body--automated')
    if (extraLabelBox) {
      extraLabel = extraLabelBox.innerText
    }
  }

  return { datetime, messageContent: content, extraLabel }
}

const slackGetChatMessagesFromNodeList = (
  messageBoxList: HTMLElement[],
): IChatMessageData[] => {
  const messages: IChatMessageData[] = []
  let username = ''
  for (const messageBox of messageBoxList) {
    const usernameBlock = messageBox.querySelector<HTMLElement>(
      '[data-qa="message_sender_name"]',
    )
    if (usernameBlock) {
      username = usernameBlock.innerText
    }

    // if doesn't have username, it means the data capture is not successful, need to relocate the usernameBlock selector
    if (username) {
      const { datetime, messageContent, extraLabel } =
        slackGetChatMessageContentAndDate(messageBox)

      messages.push({
        user: username,
        datetime,
        content: messageContent,
        extraLabel,
      })
    }
  }
  return messages
}

export const slackGetChatMessages = (inputAssistantButton: HTMLElement) => {
  const serverName = document.querySelector<HTMLElement>(
    '[class$="sidebar_header__title"]',
  )?.innerText
  const chatroomName = document.querySelector<HTMLElement>(
    '[class$="p-channel_sidebar__channel--selected"]',
  )?.innerText
  const username = document
    .querySelector<HTMLElement>('[data-qa="user-button"]')
    ?.getAttribute('aria-label')
    ?.replace('User: ', '')

  const chatMessagesPanel = findSelectorParent(
    '[data-qa="slack_kit_list"][role="list"]',
    inputAssistantButton,
  )

  const chatMessages = slackGetChatMessagesFromNodeList(
    Array.from(
      chatMessagesPanel?.querySelectorAll<HTMLElement>(
        '[data-qa="message_container"]',
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
      '.c-wysiwyg_container__footer[role="toolbar"] .c-wysiwyg_container__suffix',
      inputAssistantButton,
      2,
    )
    let replyMessage: ReturnType<
      typeof slackGetChatMessageContentAndDate
    > | null = null
    if (
      channelTextArea &&
      findSelectorParent(
        '[data-qa="threads_footer_broadcast_controls"]',
        channelTextArea,
        2,
      )
    ) {
      replyMessage = slackGetChatMessageContentAndDate(
        chatMessagesPanel.querySelector<HTMLElement>(
          '.c-message_kit__background--labels[data-qa="message_container"]',
        ),
      )
    } else {
      replyMessage = slackGetChatMessageContentAndDate(
        findParentEqualSelector(
          '[data-qa="message_container"]',
          inputAssistantButton,
        ),
      )
    }

    chatMessagesContext.replyMessage(
      replyMessage?.datetime && replyMessage?.messageContent
        ? chatMessages.findIndex(
            (message) =>
              message.datetime === replyMessage!.datetime &&
              message.content === replyMessage!.messageContent,
          )
        : chatMessages.findLastIndex((message) => message.user !== username),
    )

    return chatMessagesContext.data
  }

  return ChatMessagesContext.emptyData
}

export const slackGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const slackDraftEditor = findSelectorParent(
    '[data-qa="message_input"] > .ql-editor',
    inputAssistantButton,
    5,
  )
  return slackDraftEditor?.innerText || ''
}
