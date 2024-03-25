import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/ChatMessagesContext'

const discordGetChatMessagesFromNodeList = (
  nodeList: HTMLElement[],
): IChatMessageData[] => {
  //   debugger
  const messages: IChatMessageData[] = []
  let username = ''
  let date = ''
  for (const node of nodeList) {
    const usernameBlock = node.querySelector<HTMLElement>(
      ':not([id^="message-reply-context"]) > [class^="username"]',
    )
    if (usernameBlock) {
      username = usernameBlock.innerText
    }
    const timeBlock = node.querySelector<HTMLElement>('time')
    if (timeBlock) {
      date = timeBlock.getAttribute('datetime') || ''
    }

    // if doesn't have username, it means the data capture is not successful
    if (username) {
      const message: IChatMessageData = {
        user: username,
        date,
        content: '',
      }
      const messageContent = node.querySelector<HTMLElement>(
        ':not([id^="message-reply-context"]) > * > [id^="message-content"]',
      )
      if (messageContent) {
        // `welcome new user` notification is not a message
        if (messageContent.querySelector('[class^="welcomeCTA"]')) {
          break
        }
        message.content = messageContent?.innerText || ''
        // if message just only contains emojis
        if (!message.content) {
          const emojiContainers = Array.from(
            messageContent.querySelectorAll<HTMLElement>(
              '[clastt^="emojiContainer"]',
            ),
          )
          if (emojiContainers.length > 0) {
            message.content = emojiContainers
              .map((emojiContainer) =>
                emojiContainer.querySelector('img')?.getAttribute('aria-label'),
              )
              .join('')
          }
        }
      }
      const extraLabel = node.querySelector<HTMLElement>(
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
  debugger
  const serverName = document.querySelector<HTMLElement>('header')?.innerText
  const chatroomName = document.querySelector<HTMLElement>(
    'li[class^="containerDefault"][class*="selected"]',
  )?.innerText
  const username = document.querySelector<HTMLElement>(
    '[class^="panelTitleContainer"]',
  )?.innerText

  const chatMessages = discordGetChatMessagesFromNodeList(
    Array.from(document.querySelectorAll<HTMLElement>('[id^="chat-messages"]')),
  )

  if (chatMessages.length) {
    const chatMessagesContext = new ChatMessagesContext(chatMessages, {
      serverName: serverName || '',
      chatroomName: chatroomName || '',
      username: username || '',
    })

    return chatMessagesContext.data
  }

  return ChatMessagesContext.emptyData
}
