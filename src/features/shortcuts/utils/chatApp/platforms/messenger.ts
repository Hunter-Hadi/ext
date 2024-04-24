import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

const messengerGetChatMessagesFromNodeList = (
  messageBoxList: HTMLElement[],
  myUsername: string,
) => {
  const messages: IChatMessageData[] = []
  for (const messageBox of messageBoxList) {
    try {
      const messageData: IChatMessageData = {
        user: '',
        datetime: '',
        content: '',
      }
      const messageGridCellsBox = messageBox.querySelector<HTMLElement>(
        '[data-scope="messages_table"][role] [role] > [role] + [role="none"]',
      )
      const hasUsernameBox = messageBox.querySelector<HTMLElement>(
        '[data-scope="messages_table"][role] > [role="presentation"] h4 span, [data-scope="messages_table"][role] > span',
      )
      if (
        messageGridCellsBox &&
        getComputedStyle(messageGridCellsBox).flexDirection === 'row-reverse'
      ) {
        messageData.user = myUsername
      }
      if (hasUsernameBox) {
        if (!messageData.user) {
          messageData.user = hasUsernameBox.textContent || 'Anonymous'
        } else {
          messageData.extraLabel = `this message is that ${hasUsernameBox.textContent}`
        }
      }
      const messageBubble = messageGridCellsBox?.querySelector<HTMLElement>(
        '& > [role="presentation"]:nth-child(1)',
      )
      if (messageBubble) {
        const messageContent =
          messageBubble.querySelector<HTMLElement>('span[dir]')

        const isDocumentMessageBubble = Boolean(
          messageBubble.querySelector(
            '[download]:has(path[d="M18 8c0-.6-.4-1-1-1h-6a2 2 0 00-2 2v18c0 1.1.9 2 2 2h14a2 2 0 002-2V17c0-.6-.4-1-1-1h-4a4 4 0 01-4-4V8zm-6 7c0-.6.4-1 1-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm1 3.5a1 1 0 100 2h10a1 1 0 100-2H13zm0 4.5a1 1 0 100 2h10a1 1 0 100-2H13z"])',
          ),
        )

        // 发送 Document, Images, Video, GIF 的时候都不能附带文字
        // Document 的 case 下，messageContent 应该是文件名
        if (isDocumentMessageBubble) {
          messageData.extraLabel = `${
            messageData.extraLabel ? `${messageData.extraLabel}\n` : ''
          }this message sent a document: ${messageContent?.innerText || ''}`
        } else if (!messageContent) {
          const messageVideo = messageBubble.querySelector<HTMLElement>('video')
          const messageImages = Array.from(
            messageBubble.querySelectorAll<HTMLElement>('img'),
          )
          if (messageImages.length > 0) {
            const firstImageURL = new URL(messageImages[0].getAttribute('src')!)
            // GIF
            if (firstImageURL.pathname.toLocaleLowerCase().endsWith('.gif')) {
            } else {
            }
          } else if (messageVideo) {
          }
        } else {
          messageData.content = messageContent?.innerText || ''
        }
      }
      console.log('testestmessageBox', messageData)
      debugger
      messages.push(messageData)
    } catch (err) {
      console.error(err)
    }
  }
  return messages
}

export const messengerGetChatMessages = (inputAssistantButton: HTMLElement) => {
  // [role="main"] [role][aria-label][tabindex]:has(> span) h1 > span
  const chatroomName =
    document
      .querySelector<HTMLElement>('[role="main"]')
      ?.getAttribute('aria-label') || ''
  const myUsername =
    document
      .querySelector<HTMLElement>(
        '[role="button"][aria-label] svg[role="img"][aria-label]',
      )
      ?.getAttribute('aria-label') || 'Me'

  const configs = {
    serverName: `${myUsername} in Messenger`,
    chatroomName,
    username: myUsername,
  }

  const chatMessagesNodeList = Array.from(
    document.querySelectorAll<HTMLElement>(
      '[role="main"] [role="grid"][aria-label] div[class]:has(+ [role="gridcell"])',
    ),
  )

  if (chatMessagesNodeList.length) {
    const chatMessages = messengerGetChatMessagesFromNodeList(
      chatMessagesNodeList,
      configs.username,
    )
  }

  return ChatMessagesContext.emptyData
}

export const messengerGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const messengerDraftEditor = findSelectorParent(
    'div > [role="textbox"][contenteditable][aria-label][data-lexical-editor]',
    inputAssistantButton,
    2,
  )
  return messengerDraftEditor?.innerText || ''
}
