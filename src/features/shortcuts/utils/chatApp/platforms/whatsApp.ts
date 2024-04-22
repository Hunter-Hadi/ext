import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

const getDatetimeAndUserRegExp = /^\[(.*?)\] (.*?): $/

const whatsAppGetDataFromQuotedMessage = (
  quotedMessage: HTMLElement | null,
) => {
  let user = '',
    content = ''
  if (quotedMessage) {
    // if has testid, it means the reply target is not `me`
    // 24.04.10 update: the testid is not reliable
    // quotedMessage.querySelector<HTMLElement>('[testid="author"]')
    function isSpanElement(element: Element): element is HTMLSpanElement {
      return element.tagName.toLocaleLowerCase() === 'span'
    }
    const spanElements = Array.from(
      quotedMessage.querySelectorAll('span[aria-label]'),
    ).filter(isSpanElement)

    if (spanElements.length >= 2) {
      user = spanElements[0]?.innerText || ''
      content = spanElements[1]?.innerText || ''
      return { user, content }
    }
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
) => {
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
      // 尝试寻找quote的消息
      if (quotedMention) {
        const quotedMessage = whatsAppGetDataFromQuotedMessage(
          findParentEqualSelector(
            'div[aria-label]',
            quotedMention.parentElement!,
          ),
        )
        if (quotedMessage.content && quotedMessage.user) {
          // user可能是一个用户或者You/你
          replyMessageBoxIndex = chatMessages.findLastIndex((message) => {
            // 因为获取到的message.content可能会用`…`，所以需要处理一下
            if (
              message.content.match(/…$/) &&
              quotedMessage.content.length === message.content.length - 1
            ) {
              // 如果message被省略了，就用startsWith来判断
              return (
                message.user === quotedMessage.user &&
                quotedMessage.content.startsWith(
                  message.content.replace(/…$/, ''),
                )
              )
            }
            return (
              message.user === quotedMessage.user &&
              message.content === quotedMessage.content
            )
          })
          // 如果找不到，就找最后一个自己的消息
          if (replyMessageBoxIndex === -1) {
            replyMessageBoxIndex = chatMessages.findLastIndex((message) => {
              // 因为获取到的message.content可能会用`…`，所以需要处理一下
              if (
                message.content.match(/…$/) &&
                quotedMessage.content.length === message.content.length - 1
              ) {
                // 如果message被省略了，就用startsWith来判断
                return (
                  configs.username === configs.username &&
                  quotedMessage.content.startsWith(
                    message.content.replace(/…$/, ''),
                  )
                )
              }
              return (
                message.user === configs.username &&
                message.content === quotedMessage.content
              )
            })
          }
        }
      }
      // 如果找不到，就找最后一个非自己的消息
      if (replyMessageBoxIndex === -1) {
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
