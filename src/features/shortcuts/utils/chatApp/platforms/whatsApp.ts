import ChatMessagesContext, {
  type IChatMessageData,
  type IChatServerInfo,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import { wait } from '@/utils'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/utils/dataHelper/elementHelper'

type IWhatsAppAttachmentType = 'Photo' | 'GIF' | 'Video' | 'Poll' | 'Document'
type IWhatsAppChatMessageData = IChatMessageData & {
  attachmentType?: IWhatsAppAttachmentType
  attachmentURL?: string
}

const getDatetimeAndUserRegExp = /^\[(.*?)\] (.*?): $/
const getBackgroundImageURLRegExp = [
  /url\("?'?.*"?'?\)/g,
  /"|'|url|\(|\)/g,
] as const

const getAttachImageURL = (attachImage?: HTMLElement | null) => {
  let attachImageURL = ''
  if (attachImage) {
    if (attachImage?.matches('img[src]')) {
      attachImageURL = attachImage.getAttribute('src') || ''
    } else {
      attachImageURL =
        attachImage.style.backgroundImage
          .match(getBackgroundImageURLRegExp[0])?.[0]
          .replace(getBackgroundImageURLRegExp[1], '') || ''
    }
  }
  return attachImageURL
}

const getUsernameFromProfilePanel = async (
  configs: IChatServerInfo,
  needBack: boolean = false,
) => {
  const profilePanel = document.querySelector(
    '.two > div > div > span > div[tabindex]:has(.copyable-area > header + div [aria-label][role="button"] > [title][role="button"])',
  )
  if (profilePanel) {
    configs.username =
      profilePanel.querySelector<HTMLElement>(
        'div[tabindex]:has(button[title]) span.selectable-text.copyable-text[aria-label]',
      )?.textContent || ''
    if (needBack) {
      profilePanel
        .querySelector<HTMLElement>('[role="button"]:has(> [data-icon="back"])')
        ?.click()
      await wait(500)
    }
  }
}

const whatsAppGetDataFromQuotedMessage = (
  quotedMessage: HTMLElement | null,
) => {
  const messageData: {
    user: string
    content: string
    attachmentType?: IWhatsAppAttachmentType
    attachmentURL?: string
  } = { user: '', content: '' }

  if (quotedMessage) {
    // if has testid, it means the reply target is not `me`
    // 24.04.10 update: the testid is not reliable
    // quotedMessage.querySelector<HTMLElement>('[testid="author"]')

    // 24.04.23 update: use class `xkgnp4b` to determine the user is `me` or not
    const usernameBox = quotedMessage.querySelector<HTMLElement>('[role]')
    if (usernameBox && !usernameBox.classList.contains('xkgnp4b')) {
      // maybe the quoted message username displays like `username · groupname`
      messageData.user = (
        Array.from(usernameBox?.querySelectorAll<HTMLElement>('span')).at(-1)
          ?.innerText || ''
      ).split(' · ')[0]
    }

    const dataIcon = quotedMessage.querySelector('[data-icon]')
    if (dataIcon) {
      const iconType = dataIcon.getAttribute('data-icon')
      if (iconType === 'status-document') {
        messageData.attachmentType = 'Document'
      } else if (iconType === 'status-video') {
        messageData.attachmentType = 'Video'
      } else if (iconType === 'status-poll') {
        messageData.attachmentType = 'Poll'
      } else if (iconType === 'status-image') {
        messageData.attachmentType = 'Photo'
      } else if (iconType === 'status-gif') {
        messageData.attachmentType = 'GIF'
      }

      const attachImage = Array.from(
        quotedMessage.querySelectorAll<HTMLElement>(
          'img[src], [style*="background-image"]',
        ),
      ).at(-1)
      if (attachImage) {
        const attachImageURL = getAttachImageURL(attachImage)
        if (attachImageURL) {
          messageData.attachmentURL = attachImageURL
        }
      }
    }

    messageData.content =
      quotedMessage.querySelector<HTMLElement>('.quoted-mention')?.innerText ||
      ''
  }
  return messageData
}

const whatsAppGetMessageData = async (
  messageBox: HTMLElement,
  configs: IChatServerInfo,
) => {
  try {
    const messageData: IWhatsAppChatMessageData = {
      user: '',
      datetime: '',
      content: '',
    }

    const messageWithPrePlainText = messageBox.querySelector<HTMLElement>(
      '[data-pre-plain-text]',
    )

    if (messageWithPrePlainText) {
      const match = messageWithPrePlainText
        .getAttribute('data-pre-plain-text')
        ?.match(getDatetimeAndUserRegExp)

      if (match) {
        const [, datetime, username] = match
        messageData.user = username
        messageData.datetime = datetime
      }
    } else {
      // could not get the precise datetime, only got hh:mm
      messageData.datetime =
        Array.from(
          messageBox.querySelectorAll<HTMLElement>(
            '& > div:nth-child(2) span[dir]',
          ),
        ).at(-1)?.innerText || ''

      // maybe chatting in a group
      messageData.user =
        messageBox.querySelector<HTMLElement>(
          'div:has( > [tabindex][role="button"][aria-label]) + div span[dir][aria-label]',
        )?.innerText || ''
    }

    const messageContentBox = messageBox.querySelector<HTMLElement>(
      '.copyable-text.selectable-text[aria-label]',
    )
    if (messageContentBox) {
      const expandMoreButton = messageBox.querySelector<HTMLElement>(
        '.read-more-button[role="button"]',
      )
      if (expandMoreButton) {
        expandMoreButton.click()
        await wait(500)
      }
      messageData.content = messageContentBox.innerText || ''
    }

    const documentIcon = messageBox.querySelector<HTMLElement>(
      '[class*="icon-doc-"]',
    )
    const attachImage = Array.from(
      messageBox.querySelectorAll<HTMLElement>(
        'img[src]:not([data-plain-text]), [style*="background-image"]',
      ),
    ).at(-1)
    const viewVotesButton = messageBox.querySelector<HTMLElement>(
      'div > button[role="button"][tabindex][title]:has(> div)',
    )

    // Document
    if (documentIcon) {
      messageData.attachmentType = 'Document'
      messageData.extraLabel = `this message sent a document`
      // maybe the document has thumb img
      if (attachImage) {
        const attachImageURL = getAttachImageURL(attachImage)
        if (attachImageURL) {
          messageData.attachmentURL = attachImageURL
        }
      }
      if (!messageData.content) {
        messageData.content =
          messageBox.querySelector<HTMLElement>(
            '& > div:nth-child(2) [role="button"][title][tabindex] span[dir][aria-label]',
          )?.innerText || ''
      }
    }
    // Poll
    else if (viewVotesButton) {
      messageData.attachmentType = 'Poll'
      messageData.extraLabel = `this message started a ${
        findParentEqualSelector(
          '[aria-label]',
          viewVotesButton,
          4,
        )?.getAttribute('aria-label') || 'poll'
      }`
    }
    // Photo | GIF | Video
    else if (attachImage) {
      const attachImageURL = getAttachImageURL(attachImage)
      if (attachImageURL) {
        messageData.attachmentType = 'Photo'
        if (messageBox.querySelector('[data-icon="video-pip"]')) {
          messageData.attachmentType = 'Video'
        } else if (messageBox.querySelector('[data-icon="media-gif"]')) {
          messageData.attachmentType = 'GIF'
        }
        messageData.extraLabel = `this message sent a ${messageData.attachmentType}`
        messageData.attachmentURL = attachImageURL
        if (!messageData.content) {
          messageData.content = String(messageData.attachmentType)
        }
      }
    }

    const quotedMention =
      messageBox.querySelector<HTMLElement>('.quoted-mention')
    if (quotedMention) {
      const quotedMessage = whatsAppGetDataFromQuotedMessage(
        findParentEqualSelector('[aria-label]', quotedMention.parentElement!),
      )
      if (messageData.extraLabel) {
        messageData.extraLabel += '\n'
      } else {
        messageData.extraLabel = ''
      }
      messageData.extraLabel += `this message is replying to ${
        quotedMessage.user || configs.username
      }'s message: ${quotedMessage.content}`
    }

    return messageData
  } catch (err) {
    console.error(err)
  }
  return null
}

const whatsAppGetChatMessagesFromNodeList = async (
  messageBoxList: HTMLElement[],
  configs: IChatServerInfo,
) => {
  const messages: IWhatsAppChatMessageData[] = []

  let chattingWith = ''
  for (const messageBox of messageBoxList) {
    const messageData = await whatsAppGetMessageData(messageBox, configs)

    if (messageData) {
      if (messageBox.classList.contains('message-in') && !messageData.user) {
        // if the user is empty, it means this chatroom is a private chat
        if (!chattingWith) {
          chattingWith = configs.chatroomName
          configs.chatroomName = `Chatting with ${chattingWith}`
        }
        messageData.user = chattingWith
      } else if (messageBox.classList.contains('message-out')) {
        if (!configs.username && messageData.user) {
          configs.username = messageData.user
          configs.serverName = `${messageData.user} in WhatsApp`
        } else if (configs.username && !messageData.user) {
          messageData.user = configs.username
        }
      }

      messages.push(messageData)
    }
  }
  return messages
}

export const whatsAppGetChatMessages = async (
  inputAssistantButton: HTMLElement,
) => {
  const chatroomName =
    document.querySelector<HTMLElement>(
      '#main header > [title] + [role="button"] [aria-label]:not([title])',
    )?.innerText || ''
  const configs = {
    serverName: '',
    chatroomName,
    username: '',
  }

  const sidePanelTab = document.querySelector(
    '.two > div > div > span > div[tabindex]',
  )
  // 如果有打开的 side panel 且是 profile panel，就直接获取用户的 username
  if (sidePanelTab) {
    const isProfilePanel = sidePanelTab.matches(
      ':has(.copyable-area > header + div [aria-label][role="button"] > [title][role="button"])',
    )

    if (isProfilePanel) {
      await getUsernameFromProfilePanel(configs)
    }
  }
  // 否则尝试模拟用户行为打开 profile panel 获取用户的 username
  else {
    const avatar = document.querySelector<HTMLElement>(
      'header > div > div[data-tab][role="button"][aria-label] > img',
    )
    if (avatar) {
      const temporarySpecialStyle: HTMLStyleElement =
        document.createElement('style')
      temporarySpecialStyle.innerHTML =
        '.two>div>div:nth-child(1)>span:nth-child(1){display:none!important;} .two>div>div>span>div[tabindex]:has(.copyable-area>header+div [aria-label][role="button"]>[title][role="button"]){display:none!important;transform:none!important;}'
      document
        .getElementsByTagName('head')[0]
        .appendChild(temporarySpecialStyle)
      avatar.click()
      await wait(500)
      await getUsernameFromProfilePanel(configs, true)
      temporarySpecialStyle.remove()
    }
  }
  if (configs.username) {
    configs.serverName = `${configs.username} in WhatsApp`
  }

  const chatMessagesPanel = findSelectorParent(
    '#main [role="application"]',
    inputAssistantButton,
  )

  const chatMessagesNodeList = Array.from(
    chatMessagesPanel?.querySelectorAll<HTMLElement>(
      // '[role="row"] > [data-id]:has(> [class*="message"]), [role="row"] > [data-id][class*="message"]',
      '[role="row"] > [data-id] > [class*="message-"]',
    ) || [],
  )

  if (chatMessagesNodeList.length) {
    const chatMessages = await whatsAppGetChatMessagesFromNodeList(
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
    let replyPrivatelyQuotedMessage: IWhatsAppChatMessageData | null = null

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

        if (!quotedMessage.user) {
          quotedMessage.user = configs.username
        }

        replyMessageBoxIndex = chatMessages.findLastIndex((message) => {
          if (message.user === quotedMessage.user) {
            if (quotedMessage.attachmentType) {
              if (quotedMessage.attachmentType === message.attachmentType) {
                if (quotedMessage.attachmentURL) {
                  return quotedMessage.attachmentURL === message.attachmentURL
                }
                if (quotedMessage.content.length === message.content.length) {
                  return quotedMessage.content === message.content
                }
                return message.content.startsWith(quotedMessage.content)
              }
            } else {
              if (quotedMessage.content.length === message.content.length) {
                return quotedMessage.content === message.content
              }
              return message.content.startsWith(quotedMessage.content)
            }
            return false
          }
        })

        // 找不到 quoted message，有可能是：
        // 1. 从 group 里 reply privately 转移过来的
        // 2. 没被适配到的 quoted message
        if (replyMessageBoxIndex === -1) {
          replyMessageBoxIndex = Infinity
          replyPrivatelyQuotedMessage = {
            ...quotedMessage,
            datetime: '',
          }
          if (replyPrivatelyQuotedMessage.attachmentType === 'Poll') {
            replyPrivatelyQuotedMessage.extraLabel = `this message started a poll`
          } else if (replyPrivatelyQuotedMessage.attachmentType) {
            replyPrivatelyQuotedMessage.extraLabel = `this message sent a ${replyPrivatelyQuotedMessage.attachmentType}`
          }
        }
      } else {
        replyMessageBoxIndex = chatMessages.findLastIndex(
          (message) => message.user !== configs.username,
        )
      }
    }
    // else {
    //   whatsAppGetMessageData()
    // }

    if (chatMessages.length) {
      if (replyMessageBoxIndex === Infinity) {
        if (replyPrivatelyQuotedMessage) {
          const chatMessagesContext = new ChatMessagesContext(
            chatMessages,
            configs,
          )
          chatMessagesContext.replyMessage(replyPrivatelyQuotedMessage)
          return chatMessagesContext.data
        }
      } else {
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
