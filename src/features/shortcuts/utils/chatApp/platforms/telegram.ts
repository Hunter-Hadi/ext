import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import { findSelectorParent } from '@/utils/dataHelper/elementHelper'

const telegramUsernameMap = new Map<string, string>()

const telegramGetDataFromQuotedMessage = (
  quotedMessage: HTMLElement | null,
) => {
  let user = '',
    content = ''
  if (quotedMessage) {
    user =
      quotedMessage.querySelector<HTMLElement>(
        '.reply-title .peer-title[data-peer-id]',
      )?.innerText || ''
    if (!quotedMessage.querySelector('.media-sticker-wrapper')) {
      content =
        quotedMessage.querySelector<HTMLElement>('.reply-subtitle')
          ?.innerText || ''
    }
  }
  return { user, content }
}

const telegramGetMessageData = async (
  messageBox: HTMLElement,
  username: string,
) => {
  if (messageBox) {
    const nameBox = messageBox.querySelector<HTMLElement>(
      '.bubble-content > .name[data-peer-id] .peer-title[data-peer-id]',
    )

    if (nameBox) {
      telegramUsernameMap.set(
        nameBox.getAttribute('data-peer-id')!,
        (username = nameBox?.textContent || ''),
      )
    }

    // temp: need to optimize
    if (!username) {
      const avatarBox = findSelectorParent(
        '.bubbles-group-avatar-container > .avatar[data-peer-id]',
        messageBox,
        1,
      )
      username =
        telegramUsernameMap.get(
          avatarBox?.getAttribute('data-peer-id') || '',
        ) || ''

      if (!username && avatarBox) {
        const currentChatBox = document.querySelector<HTMLElement>(
          '#column-center > .chats-container > .chat.active',
        )
        if (currentChatBox) {
          let temporarySpecialStyle: HTMLStyleElement | null = null
          await new Promise<void>((resolve) => {
            const chatsContainer = document.querySelector(
              '#column-center > .chats-container',
            )
            currentChatBox.style.transform = 'none'
            currentChatBox.style.cssText += 'display: flex!important;'
            temporarySpecialStyle = document.createElement('style')
            temporarySpecialStyle.innerHTML = `#column-center>.chats-container>.chat.active{display:none!important;}`
            document
              .getElementsByTagName('head')[0]
              .appendChild(temporarySpecialStyle)
            const observer = new MutationObserver(() => {
              const chatBox = document.querySelector<HTMLElement>(
                '#column-center > .chats-container > .chat.active',
              )
              if (username) {
                observer.disconnect()
                if (temporarySpecialStyle) {
                  if (chatBox) {
                    chatBox.style.transform = ''
                  }
                  currentChatBox.style.transform = ''
                  currentChatBox.style.display = ''
                  // eslint-disable-next-line no-extra-semi
                  ;(temporarySpecialStyle as HTMLStyleElement).remove()
                }
                resolve()
              } else if (chatBox && chatBox !== currentChatBox) {
                chatBox.style.transform = 'none'
                telegramUsernameMap.set(
                  avatarBox.getAttribute('data-peer-id')!,
                  (username =
                    chatBox?.querySelector<HTMLElement>(
                      '.chat-info .content > .top > .user-title > .peer-title[data-peer-id]',
                    )?.innerText || 'Anonymous'),
                )
                chatBox
                  ?.querySelector<HTMLElement>('button.sidebar-close-button')
                  ?.click()
              }
            })
            observer.observe(chatsContainer!, {
              childList: true,
              subtree: true,
            })
            avatarBox.click()
          })
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
      if (messageBox.querySelector('[data-sticker-emoji]')) {
        messageData.extraLabel += `: ${messageBox
          .querySelector('[data-sticker-emoji]')
          ?.getAttribute('data-sticker-emoji')}`
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
      const mediaContainer = messageBox?.querySelector('.media-container')
      const documentContainer = message?.querySelector('.document-container')

      // replying to quoted message
      if (replying) {
        const quotedMessage = telegramGetDataFromQuotedMessage(replying)
        messageData.extraLabel = `${username} is replying to ${quotedMessage.user}'s message: ${quotedMessage.content}`
        replying.remove()
      }
      // document
      else if (documentContainer) {
        messageData.extraLabel = `${username} sent a document: ${
          documentContainer.querySelector('.document-name')?.textContent || ''
        }`
        documentContainer.remove()
      }
      // media
      else if (mediaContainer) {
        messageData.extraLabel = `${username} sent media: ${
          mediaContainer.querySelector('[src]')?.getAttribute('src') || ''
        }`
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
  for (const messageBox of messageBoxList) {
    const messageData = await telegramGetMessageData(
      messageBox,
      messageBox.matches('.is-out') ? configs.username : chattingWith,
    )

    if (messageData) {
      messages.push(messageData)
    }
  }
  return messages
}

export const telegramGetChatMessages = async (
  inputAssistantButton: HTMLElement,
) => {
  debugger
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

  if (
    !document.querySelector<HTMLElement>(
      '.settings-container.profile-container.active .sidebar-content .profile-content.is-me',
    )
  ) {
    const temporarySpecialStyle = document.createElement('style')
    temporarySpecialStyle.innerHTML = `#column-left .tabs-tab:not(.settings-container.profile-container){display:flex!important;transform:none!important;} .sidebar-header>.sidebar-header__btn-container button>.btn-menu{display:none!important;} .settings-container.profile-container{display:none!important;}`
    document.getElementsByTagName('head')[0].appendChild(temporarySpecialStyle)
    const menuButton = document.querySelector<HTMLElement>(
      '.sidebar-header > .sidebar-header__btn-container button:not(.menu-open)',
    )
    if (menuButton) {
      await new Promise<void>((resolve) => {
        const leftTabsContainer = document.querySelector(
          '#column-left > .tabs-container',
        )
        if (leftTabsContainer) {
          let jumpToSettings = false
          const observer = new MutationObserver(() => {
            const profileContainer = document.querySelector<HTMLElement>(
              '.settings-container.profile-container.active',
            )
            if (profileContainer) {
              configs.username =
                profileContainer.querySelector<HTMLElement>(
                  '.sidebar-content .profile-content.is-me .profile-name .peer-title[data-peer-id]',
                )?.textContent || 'Me'
              profileContainer
                .querySelector<HTMLElement>(
                  '.sidebar-header button.sidebar-close-button',
                )
                ?.click()
              console.log('testest1111')
              observer.disconnect()
              resolve()
            } else if (!jumpToSettings) {
              const jumpToSettingsButton = menuButton
                ?.querySelectorAll<HTMLElement>(
                  '.btn-menu.was-open > .btn-menu-item',
                )
                .item(3)
              if (jumpToSettingsButton) {
                jumpToSettingsButton.click()
                jumpToSettings = true
              }
            }
          })
          observer.observe(leftTabsContainer, {
            childList: true,
            subtree: true,
          })
        } else {
          resolve()
        }
        menuButton?.click()
      })
    }
    console.log('testest2222')
    temporarySpecialStyle?.remove()
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
        replyMessageBoxIndex = chatMessages.findIndex(
          (message) =>
            message.user === quotedMessage.user &&
            message.content === quotedMessage.content,
        )
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
