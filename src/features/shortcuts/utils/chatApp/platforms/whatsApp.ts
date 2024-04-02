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

const whatsAppGetChatMessagesFromNodeList = (
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

export const whatsAppGetChatMessages = (inputAssistantButton: HTMLElement) => {
  const chatroomName = document.querySelector<HTMLElement>(
    'header > [title="Profile Details"] + [role="button"] [aria-label]:not([title])',
  )?.innerText
  const myAvatar = document.querySelector<HTMLElement>(
    'header [role="button"][aria-label] > img',
  )

  const chatMessagesPanel = findSelectorParent(
    '#main [role="application"]',
    inputAssistantButton,
  )

  const chatMessagesNodeList = Array.from(
    chatMessagesPanel?.querySelectorAll<HTMLElement>(
      '[role="row"] > [data-id]:has(> [class*="message"])',
    ) || [],
  ).filter((node) => node.querySelector('[data-pre-plain-text]'))

  if (chatMessagesNodeList) {
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

    let replyMessageBox: HTMLElement | null = null

    if (channelTextArea && quotedMention) {
      // if have testid, it means the reply target is someone else
      const isOthersReply = findSelectorParent(
        '[testid="author"]',
        quotedMention,
        2,
      )
      if (isOthersReply) {
      } else {
      }
    } else {
    }

    const chatMessages = whatsAppGetChatMessagesFromNodeList(
      chatMessagesNodeList.slice(
        0,
        chatMessagesNodeList.findIndex(
          (messageBox) => messageBox === replyMessageBox,
        ) + 1,
      ),
    )

    if (chatMessages.length) {
      // const chatMessagesContext = new ChatMessagesContext(chatMessages, {
      //   serverName: serverName || '',
      //   chatroomName: chatroomName || '',
      //   username: username || '',
      // })
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
