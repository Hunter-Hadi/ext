import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import { wait } from '@/utils'
import { findSelectorParent } from '@/utils/dataHelper/elementHelper'

const telegramUsernameMap = new Map<string, string>()

const telegramGetDataFromQuotedMessage = (
  quotedMessage: HTMLElement | null,
) => {
  const messageData: {
    user: string
    content: string
    extraLabel?: string
    sticker: boolean
    media: boolean
  } = {
    user: '',
    content: '',
    sticker: false,
    media: false,
  }
  if (quotedMessage) {
    messageData.user =
      quotedMessage.querySelector<HTMLElement>(
        '.reply-title .peer-title[data-peer-id]',
      )?.innerText || ''

    const mediaSticker = quotedMessage.querySelector<HTMLElement>(
      '.media-sticker-wrapper',
    )
    const mediaContainer =
      quotedMessage.querySelector<HTMLElement>('.media-container')
    const subtitle = quotedMessage.querySelector<HTMLElement>('.reply-subtitle')
    if (mediaSticker) {
      messageData.sticker = true
      messageData.extraLabel = `${messageData.user} sent a sticker`
    } else if (mediaContainer) {
      messageData.media = true
      messageData.extraLabel = `[${mediaContainer
        .querySelector('[src]')
        ?.getAttribute('src')}]`
    }
    messageData.content = subtitle?.innerText || ''
  }
  return messageData
}

const telegramGetMessageData = async (
  messageBox: HTMLElement,
  username: string,
) => {
  if (messageBox) {
    const nameBox = messageBox.querySelector<HTMLElement>(
      '.bubble-content > .name[data-peer-id] .peer-title[data-peer-id]',
    )
    let userPeerId = ''

    if (nameBox) {
      username = nameBox?.textContent || ''
      userPeerId = nameBox.getAttribute('data-peer-id')!
      telegramUsernameMap.set(userPeerId, username)
    }

    // temp: need to optimize
    if (!username) {
      const avatarBox = findSelectorParent(
        '.bubbles-group-avatar-container > .avatar[data-peer-id]',
        messageBox,
        1,
      )
      if (avatarBox) {
        userPeerId = avatarBox.getAttribute('data-peer-id')!
        username = telegramUsernameMap.get(userPeerId) || ''

        // To get the message sender's username, should perform the following actions implicitly and not being perceived by the user
        // right click avatar -> open contextmenu -> click `Search` -> get the username -> click close button
        if (!username) {
          avatarBox.dispatchEvent(
            new MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
              button: 2,
            }),
          )
          await wait(500)
          const contextmenu = document.querySelector<HTMLElement>(
            '#bubble-contextmenu.was-open',
          )
          if (contextmenu) {
            const searchButton = contextmenu
              .querySelectorAll<HTMLElement>('& > .btn-menu-item')
              .item(2)
            if (searchButton) {
              searchButton.click()
              await wait(500)
            }
          }
          username =
            document.querySelector<HTMLElement>(
              `.topbar-search-container .selector-user .peer-title[data-peer-id="${userPeerId}"]`,
            )?.innerText || 'Anonymous'
          telegramUsernameMap.set(
            avatarBox.getAttribute('data-peer-id')!,
            username,
          )
          // chatBox
          //   ?.querySelector<HTMLElement>('button.sidebar-close-button')
          //   ?.click()
          // await wait(500)
        }
      }
    }

    const messageData: IChatMessageData = {
      user: username,
      datetime: '',
      content: '',
    }

    if (messageBox.matches('.sticker')) {
      messageData.extraLabel = `${username} sent a sticker`
      messageData.datetime =
        messageBox
          .querySelector<HTMLElement>('.message .time-inner')
          ?.getAttribute('title') || ''
      const emoji = messageBox
        .querySelector('[data-sticker-emoji]')
        ?.getAttribute('data-sticker-emoji')
      if (emoji) {
        messageData.extraLabel += `: ${emoji}`
        messageData.content = emoji
      }
    } else {
      let message: HTMLElement | null = messageBox
        .querySelector<HTMLElement>('.message')
        ?.cloneNode(true) as HTMLElement

      const timeInner = message?.querySelector('.time-inner')
      messageData.datetime = timeInner?.getAttribute('title') || ''
      timeInner?.parentElement?.remove()

      message.querySelector('reactions-element')?.remove()

      const replying = message?.querySelector<HTMLElement>('.reply')
      const webpageQuote = message?.querySelector<HTMLElement>('.webpage-quote')
      const mediaContainer = messageBox?.querySelector('.media-container')
      const documentContainer = message?.querySelector('.document-container')

      // replying to quoted message
      if (replying) {
        const quotedMessage = telegramGetDataFromQuotedMessage(replying)
        messageData.extraLabel = `${username} is replying to ${quotedMessage.user}'s message: ${quotedMessage.content}`
        replying.remove()
      }
      // webpage quote
      else if (webpageQuote) {
        const webpage =
          webpageQuote.querySelector<HTMLAnchorElement>('a.webpage-name')
        const webpageTitle =
          webpageQuote.querySelector<HTMLElement>('.webpage-title')
            ?.innerText || ''
        const webpageText =
          webpageQuote.querySelector<HTMLElement>('.webpage-text')?.innerText ||
          ''
        messageData.extraLabel = `${username} sent a webpage: ${webpage?.innerText}[${webpage?.href}]\n${webpageTitle}\n${webpageText}`
        webpageQuote.remove()
      }
      // document
      else if (documentContainer) {
        messageData.extraLabel = `${username} sent a document: ${
          documentContainer.querySelector('.document-name')?.textContent || ''
        }[${documentContainer.querySelector('[src]')?.getAttribute('src')}]`
        documentContainer.remove()
      }
      // media
      else if (mediaContainer) {
        messageData.extraLabel = `${username} sent media[${
          mediaContainer.querySelector('[src]')?.getAttribute('src') || ''
        }]`
      }

      messageData.content = message.textContent || ''

      message = null
    }

    return messageData
  }
  return null
}

const telegramGetChatMessagesFromNodeList = async (
  messageBoxList: HTMLElement[],
  configs: {
    serverName: string
    chatroomName: string
    username: string
  },
) => {
  // if the serverName is empty, it means it's a private chat,
  // and the chatroomName is the username of the person being chatted with.
  let chattingWith = ''
  if (!configs.serverName) {
    chattingWith = configs.chatroomName
    configs.serverName = `${configs.username} in Telegram`
    configs.chatroomName = `Chatting with ${chattingWith}`
  }

  const messages: IChatMessageData[] = []

  // prevent the action of getting data from affecting the style and then being perceived by the user
  const currentChatBox = document.querySelector<HTMLElement>(
    '#column-center > .chats-container > .chat.active',
  )
  currentChatBox?.classList.add(
    'MAXAI__CURRENT_CHAT_BOX__SPEICIAL_STYLE',
    'MAXAI__CHAT_BOX__SPEICIAL_STYLE',
  )
  const temporarySpecialStyle = document.createElement('style')
  temporarySpecialStyle.innerHTML = `#bubble-contextmenu{display:none!important;}.chat-info .content,.chat-info:has(.content)+.chat-utils{opacity:1!important;}`
  // 如果一开始没有 topbarSearchContainer，就要添加样式使得其不可见
  let topbarSearchContainer = document.querySelector<HTMLElement>(
    '.topbar-search-container',
  )
  if (!topbarSearchContainer) {
    temporarySpecialStyle.innerHTML +=
      '.topbar-search-container{opacity:0!important;}'
  }
  document.getElementsByTagName('head')[0].appendChild(temporarySpecialStyle)
  for (const messageBox of messageBoxList) {
    const messageData = await telegramGetMessageData(
      messageBox,
      messageBox.matches('.is-out') ? configs.username : chattingWith,
    )

    if (messageData) {
      messages.push(messageData)
    }
  }
  // 将产生的 topbarSearchContainer 销毁
  if (!topbarSearchContainer) {
    topbarSearchContainer = document.querySelector<HTMLElement>(
      '.topbar-search-container',
    )
    let tryLimit = 0
    while (topbarSearchContainer && tryLimit < 10) {
      tryLimit++
      topbarSearchContainer
        .querySelector<HTMLElement>('button.input-search-clear')
        ?.click()
      await wait(100)
      topbarSearchContainer = document.querySelector<HTMLElement>(
        '.topbar-search-container',
      )
    }
  }
  currentChatBox?.classList.remove(
    'MAXAI__CURRENT_CHAT_BOX__SPEICIAL_STYLE',
    'MAXAI__CHAT_BOX__SPEICIAL_STYLE',
  )
  temporarySpecialStyle?.remove()
  return messages
}

export const telegramGetChatMessages = async (
  inputAssistantButton: HTMLElement,
) => {
  const serverName =
    document.querySelector<HTMLElement>(
      '.chat-info .content > .bottom > .info .peer-title[data-peer-id]',
    )?.innerText || ''
  const chatroomName =
    document.querySelector<HTMLElement>(
      '.chat-info .content > .top > .user-title > .peer-title[data-peer-id]',
    )?.innerText || ''

  const configs = {
    serverName,
    chatroomName,
    username: 'Me',
  }

  // To get my username, should open the settings page implicitly and not being perceived by the user
  const profileBoxExists = Boolean(
    document.querySelector<HTMLElement>(
      '.settings-container.profile-container.active .sidebar-content .profile-content.is-me',
    ),
  )
  const temporarySpecialStyle: HTMLStyleElement =
    document.createElement('style')
  const activeTab = document.querySelector<HTMLElement>(
    '#column-left > .tabs-container > .tabs-tab.active',
  )
  if (!profileBoxExists) {
    const menuButton = document.querySelector<HTMLElement>(
      '.sidebar-header > .sidebar-header__btn-container button:not(.menu-open)',
    )
    if (menuButton) {
      activeTab?.classList.add('MAXAI__ACTIVE_TAB__SPEICIAL_STYLE')
      temporarySpecialStyle.innerHTML = `.MAXAI__ACTIVE_TAB__SPEICIAL_STYLE{display:flex!important;transform:none!important;filter:none!important;} .sidebar-header>.sidebar-header__btn-container button>.btn-menu{display:none!important;} .settings-container.profile-container{display:none!important;}`
      document
        .getElementsByTagName('head')[0]
        .appendChild(temporarySpecialStyle)
      menuButton?.click()
      await wait(500)
      const jumpToSettingsButton = menuButton
        ?.querySelectorAll<HTMLElement>('.btn-menu.was-open > .btn-menu-item')
        .item(3)
      if (jumpToSettingsButton) {
        jumpToSettingsButton.click()
        await wait(500)
      }
    }
  }
  const profileContainer = document.querySelector<HTMLElement>(
    '.settings-container.profile-container.active',
  )
  if (profileContainer) {
    configs.username =
      profileContainer.querySelector<HTMLElement>(
        '.sidebar-content .profile-content.is-me .profile-name .peer-title[data-peer-id]',
      )?.textContent || 'Me'
    if (!profileBoxExists) {
      profileContainer
        .querySelector<HTMLElement>(
          '.sidebar-header button.sidebar-close-button',
        )
        ?.click()
      await wait(500)
      activeTab?.classList.remove('MAXAI__ACTIVE_TAB__SPEICIAL_STYLE')
      temporarySpecialStyle?.remove()
    }
  }

  const chatMessagesPanel = document.querySelector(
    '.bubbles .scrollable > .bubbles-inner',
  )

  const chatMessagesNodeList = Array.from(
    chatMessagesPanel?.querySelectorAll<HTMLElement>(
      '.bubbles-date-group .bubbles-group .bubble[data-peer-id]',
    ) || [],
  )

  if (chatMessagesNodeList.length) {
    const chatMessages = await telegramGetChatMessagesFromNodeList(
      chatMessagesNodeList,
      configs,
    )
    telegramUsernameMap.clear()

    const chatTextArea = findSelectorParent(
      '.input-message-input[data-peer-id]',
      inputAssistantButton,
      2,
    )
    const quotedMention = findSelectorParent(
      '.is-helper-active .chat-input-main .reply-wrapper .reply',
      chatTextArea,
      3,
    )
    let replyMessageBoxIndex = -1

    if (chatTextArea) {
      if (quotedMention) {
        const quotedMessage = telegramGetDataFromQuotedMessage(quotedMention)
        replyMessageBoxIndex = chatMessages.findLastIndex((message) => {
          if (message.user === quotedMessage.user) {
            if (quotedMessage.sticker) {
              let isSameSticker = message.extraLabel?.startsWith(
                quotedMessage.extraLabel!,
              )
              if (message.content) {
                isSameSticker &&= quotedMessage.content.startsWith(
                  message.content,
                )
              }
              return isSameSticker
            } else if (quotedMessage.media) {
              // 因为无法判断是文件还是图片，而且 full 和 thumb 的资源地址可能也不一样
              // 所以只要是 media 类型，就资源地址和内容都比较一下
              const quotedMediaMessageContent = quotedMessage.content.replace(
                /^.+, /,
                '',
              )
              if (quotedMessage.content.length > 100) {
                quotedMediaMessageContent.replace(/\.\.\.$/, '')
              }
              return (
                message.extraLabel?.endsWith(quotedMessage.extraLabel!) ||
                message.content.startsWith(quotedMediaMessageContent)
              )
            } else {
              // 100 text limit is from tweb(https://github.com/morethanwords/tweb/blob/b6486ad81d7523284affd4900bcd2663da079e4e/src/components/wrappers/messageForReply.ts#L275)
              return quotedMessage.content.length > 100
                ? message.content.startsWith(
                    quotedMessage.content.replace(/\.\.\.$/, ''),
                  )
                : message.content === quotedMessage.content
            }
          }
          return false
        })
      } else {
        replyMessageBoxIndex = chatMessages.findLastIndex(
          (message) => message.user !== configs.username,
        )
      }
    }

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

export const telegramGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const telegramDraftEditor = findSelectorParent(
    '.input-message-input[data-peer-id]',
    inputAssistantButton,
    2,
  )
  return telegramDraftEditor?.innerText || ''
}
