import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

const getDirectMessageUserRegExp = /^(.*?) \(.*\)$/

const slackGetChatMessageContentAndDate = (
  messageBox: HTMLElement | null,
  username: string,
) => {
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

      // if message just only contains emojis
      if (!content) {
        content = Array.from(
          messageContentBox.querySelectorAll<HTMLElement>('[data-qa="emoji"]'),
        )
          .map((emoji) => emoji.getAttribute('data-stringify-emoji'))
          .join('')
      }
    }

    const extraLabelBox =
      messageBox.querySelector<HTMLElement>(
        '.c-message__broadcast_preamble_outer',
      ) || messageBox.querySelector<HTMLElement>('.c-message__body--automated')
    const messageAttachment = messageBox.querySelector<HTMLElement>(
      '[data-qa="message_attachment_default"]',
    )
    if (extraLabelBox) {
      extraLabel = extraLabelBox.innerText
    } else if (messageAttachment) {
      const attachmentAuthor =
        messageAttachment.querySelector<HTMLElement>(
          '.c-message_attachment__author--distinct[data-qa="message_attachment_author"]',
        )?.innerText || ''
      if (attachmentAuthor) {
        const attachmentContentBox =
          messageAttachment.querySelector<HTMLElement>(
            '[data-qa="message_attachment_slack_msg_text"]',
          )
        const expandButton = attachmentContentBox?.querySelector<HTMLElement>(
          'button.c-rich_text_expand_button',
        )
        if (expandButton) {
          expandButton.click()
        }
        extraLabel = `${username} is forwarding a message by ${attachmentAuthor}: ${
          attachmentContentBox?.innerText || ''
        }`
      }
    }
  }

  return { datetime, messageContent: content, extraLabel }
}

const slackGetChatMessagesFromNodeList = (
  messageBoxList: HTMLElement[],
  username: string,
): IChatMessageData[] => {
  const messages: IChatMessageData[] = []
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
        slackGetChatMessageContentAndDate(messageBox, username)

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
  const currentChannel = document.querySelector<HTMLElement>(
    '[class$="p-channel_sidebar__channel--selected"]',
  )
  const isDirectMessage =
    currentChannel &&
    document
      .querySelector(
        '[data-qa-channel-sidebar-section-heading="direct_messages"]',
      )
      ?.compareDocumentPosition(currentChannel) === 4
  const chatroomName = `${isDirectMessage ? 'Chatting with ' : ''}${
    currentChannel?.innerText || ''
  }`
  const username = document
    .querySelector<HTMLElement>('[data-qa="user-button"]')
    ?.getAttribute('aria-label')
    ?.replace('User: ', '')

  const chatMessagesPanel = findSelectorParent(
    '[data-qa="slack_kit_list"][role="list"]',
    inputAssistantButton,
  )

  const chatMessagesNodeList = Array.from(
    chatMessagesPanel?.querySelectorAll<HTMLElement>(
      '[data-qa="message_container"]',
    ) || [],
  )

  if (chatMessagesNodeList.length) {
    const chatMessages = slackGetChatMessagesFromNodeList(
      chatMessagesNodeList,
      (isDirectMessage
        ? document
            .querySelector<HTMLElement>(
              '[data-qa="slack_kit_list"][role="list"]',
            )
            ?.getAttribute('aria-label')
        : ''
      )?.match(getDirectMessageUserRegExp)?.[1] || '',
    )
    const channelTextArea = findParentEqualSelector(
      '.c-wysiwyg_container__footer[role="toolbar"] .c-wysiwyg_container__suffix',
      inputAssistantButton,
      2,
    )
    let replyMessageBoxIndex = -1

    if (channelTextArea) {
      if (
        findSelectorParent(
          '[data-qa="threads_footer_broadcast_controls"]',
          channelTextArea,
          2,
        )
      ) {
        replyMessageBoxIndex = chatMessagesNodeList.findLastIndex(
          (messageBox) =>
            messageBox.matches(
              '.c-message_kit__background--labels[data-qa="message_container"]',
            ),
        )
      } else {
        replyMessageBoxIndex = chatMessages.findLastIndex(
          (message) => message.user !== username,
        )
      }
    } else {
      const replyMessageBox = findParentEqualSelector(
        '[data-qa="message_container"]',
        inputAssistantButton,
      )
      replyMessageBoxIndex = chatMessagesNodeList.findLastIndex(
        (messageBox) => messageBox !== replyMessageBox,
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

export const slackGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const slackDraftEditor = findSelectorParent(
    '[data-qa="message_input"] > .ql-editor',
    inputAssistantButton,
    5,
  )
  return slackDraftEditor?.innerText || ''
}
