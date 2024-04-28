import ChatMessagesContext, {
  IChatMessageData,
} from '@/features/shortcuts/utils/chatApp/ChatMessagesContext'
import { wait } from '@/utils'
import { findSelectorParent } from '@/utils/dataHelper/elementHelper'

const telegramUsernameMap = new Map<string, string>()
const settingsButtonIcon = ''
const callButtonIcon = ''

// https://github.com/morethanwords/tweb/blob/53224468fe63fb2b024dc697a15f03679f11a93b/src/components/wrappers/messageForReply.ts#L114
type ITelegramMediaType = 'Photo' | 'GIF' | 'Video' | 'Document'
type ITelegramChatMessageData = IChatMessageData & {
  mediaType?: ITelegramMediaType
}

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
      messageData.extraLabel = `this message sent a sticker`
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
  try {
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
          // 24.04.23 update: the above method is not working because the contextmenu is not opening -> [https://github.com/morethanwords/tweb/commit/0eb3ef36b6ec81a891139564059ccee4b8c3ef8b#diff-26b3883bdd0053bad134a65d5dc94c352819cfa5680a9af442899036ef41ad45]
          if (!username) {
            // avatarBox.dispatchEvent(
            //   new MouseEvent('contextmenu', {
            //     bubbles: true,
            //     cancelable: true,
            //     button: 2,
            //   }),
            // )
            // await wait(500)
            // const contextmenu = document.querySelector<HTMLElement>(
            //   '#bubble-contextmenu.was-open',
            // )
            // if (contextmenu) {
            //   const searchButton = contextmenu
            //     .querySelectorAll<HTMLElement>('& > .btn-menu-item')
            //     .item(2)
            //   if (searchButton) {
            //     searchButton.click()
            //     await wait(500)
            //   }
            // }
            // username =
            //   document.querySelector<HTMLElement>(
            //     `.topbar-search-container .selector-user .peer-title[data-peer-id="${userPeerId}"]`,
            //   )?.innerText || 'Anonymous'
            // telegramUsernameMap.set(
            //   avatarBox.getAttribute('data-peer-id')!,
            //   username,
            // )

            // Temporary solution: use the avatar inner text as the username
            // if reply this message, it could get the wrong target message
            username = avatarBox.innerText || 'Anonymous'
          }
        }
      }

      const messageData: ITelegramChatMessageData = {
        user: username,
        datetime: '',
        content: '',
      }

      // message content only contains sticker
      if (messageBox.classList.contains('sticker')) {
        messageData.extraLabel = `this message sent a sticker`
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

        if (message) {
          const timeInner = message?.querySelector('.time-inner')
          messageData.datetime = timeInner?.getAttribute('title') || ''
          timeInner?.parentElement?.remove()

          message.querySelector('reactions-element')?.remove()

          const replying = message?.querySelector<HTMLElement>('.reply')
          const webpageQuote =
            message?.querySelector<HTMLElement>('.webpage-quote')
          const mediaContainer = messageBox?.querySelector('.media-container')
          const documentContainer = message?.querySelector(
            '.document-container',
          )

          // replying to quoted message
          if (replying) {
            const quotedMessage = telegramGetDataFromQuotedMessage(replying)
            messageData.extraLabel = `this message is replying to ${quotedMessage.user}'s message: ${quotedMessage.content}`
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
              webpageQuote.querySelector<HTMLElement>('.webpage-text')
                ?.innerText || ''
            messageData.extraLabel = `this message sent a ${webpage?.innerText} webpage[${webpage?.href}]: ${webpageTitle}\n${webpageText}`
            webpageQuote.remove()
          }
          // document
          else if (documentContainer) {
            const documentName =
              documentContainer.querySelector('.document-name')?.textContent ||
              ''
            const documentMessage =
              documentContainer.querySelector('.document-message')
                ?.textContent || ''
            messageData.mediaType = 'Document'
            messageData.extraLabel = `this message sent a document: ${documentName}[${documentContainer
              .querySelector('[src]')
              ?.getAttribute('src')}]`
            messageData.content = `${documentName}${
              documentMessage ? `, ${documentMessage}` : ''
            }`
            documentContainer.remove()
          }
          // media
          else if (mediaContainer) {
            const videoTime = mediaContainer.querySelector('.video-time')
            if (videoTime) {
              // Video
              if (videoTime.querySelector('.video-time-icon')) {
                messageData.mediaType = 'Video'
              }
              // GIF
              else {
                messageData.mediaType = 'GIF'
              }
            }
            // Photo
            else {
              messageData.mediaType = 'Photo'
            }

            messageData.extraLabel = `this message sent a ${
              messageData.mediaType
            }[${
              mediaContainer.querySelector('[src]')?.getAttribute('src') || ''
            }]`
            messageData.content = messageData.mediaType
          }

          if (message.textContent!.length > 0) {
            if (messageData.mediaType) {
              messageData.content += ', '
            }
            messageData.content += message.textContent
          }

          message = null
        }
      }

      return messageData
    }
  } catch (err) {
    console.error(err)
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
  // if the serverName is empty and it has call button, it means it's a private chat.
  // and the chatroomName is the username of the person being chatted with.
  let chattingWith = ''
  if (!configs.serverName) {
    configs.serverName = `${configs.username} in Telegram`
    const callButton = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.chats-container > .chat.active .chat-utils .btn-icon:not(.hide) > .button-icon',
      ),
    ).find((icon) => icon.textContent === callButtonIcon)
    if (callButton) {
      chattingWith = configs.chatroomName
      configs.chatroomName = `Chatting with ${chattingWith}`
    }
  }

  const messages: ITelegramChatMessageData[] = []

  // prevent the action of getting data from affecting the style and then being perceived by the user
  const currentChatBox = document.querySelector<HTMLElement>(
    '#column-center > .chats-container > .chat.active',
  )
  currentChatBox?.classList.add(
    'MAXAI__CURRENT_CHAT_BOX__SPEICIAL_STYLE',
    'MAXAI__CHAT_BOX__SPEICIAL_STYLE',
  )
  const temporarySpecialStyle = document.createElement('style')
  temporarySpecialStyle.innerHTML = `#bubble-contextmenu{display:none!important;}`
  // 如果一开始没有 topbarSearchContainer，就要添加样式使得其不可见
  let topbarSearchContainer = document.querySelector<HTMLElement>(
    '.topbar-search-container',
  )
  if (!topbarSearchContainer) {
    temporarySpecialStyle.innerHTML +=
      '.chat-info .content,.chat-info:has(.content)+.chat-utils{opacity:1!important;} .topbar-search-container{opacity:0!important;}'
  }
  document.getElementsByTagName('head')[0].appendChild(temporarySpecialStyle)
  for (const messageBox of messageBoxList) {
    const messageData = await telegramGetMessageData(
      messageBox,
      messageBox.classList.contains('is-out') ? configs.username : chattingWith,
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
  let profileContainer = document.querySelector<HTMLElement>(
    '.settings-container.profile-container.active',
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
    if (menuButton && activeTab) {
      // add styles for not being perceived by the user
      activeTab.classList.add('MAXAI__ACTIVE_TAB__SPEICIAL_STYLE')
      temporarySpecialStyle.innerHTML = `.MAXAI__ACTIVE_TAB__SPEICIAL_STYLE{display:flex!important;transform:none!important;filter:none!important;} .sidebar-header>.sidebar-header__btn-container button>.btn-menu{display:none!important;} .settings-container.profile-container{display:none!important;transform:none!important;}`
      document
        .getElementsByTagName('head')[0]
        .appendChild(temporarySpecialStyle)

      await new Promise<void>((resolve) => {
        let tryLimit = 0
        let clickedJumpToSettings = false
        // 用 MutationObserver 来检测 Menu 打开 -> 点击 Settings 跳转到 Settings 页面
        const observer = new MutationObserver(() => {
          tryLimit++
          if (tryLimit === 20) {
            observer.disconnect()
            resolve()
          }

          if (clickedJumpToSettings) {
            profileContainer = document.querySelector<HTMLElement>(
              '.settings-container.profile-container.active',
            )
            if (profileContainer) {
              observer.disconnect()
              resolve()
            }
          } else {
            const jumpToSettingsButton = Array.from(
              menuButton?.querySelectorAll<HTMLElement>(
                '.btn-menu.was-open > .btn-menu-item > .btn-menu-item-icon',
              ),
            ).find((icon) => icon.textContent === settingsButtonIcon)
            if (jumpToSettingsButton) {
              jumpToSettingsButton.click()
              clickedJumpToSettings = true
            }
          }
        })
        observer.observe(
          document.querySelector(
            '#column-left > .tabs-container',
          ) as HTMLElement,
          {
            childList: true,
            subtree: true,
          },
        )
        menuButton?.click()
        setTimeout(() => {
          observer.disconnect()
          resolve()
        }, 2000)
      })
    }
  }
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
      '.bubbles-date-group .bubbles-group .bubble[data-peer-id]:is(.is-in, .is-out)',
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
    let replyUnfoundQuotedMessage: ITelegramChatMessageData | null = null
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
              // 因为无法判断 reply media 的类型，而且 full img 和 thumb img 的资源地址可能也不一样
              if (message.mediaType === 'Document') {
                // Document 的 thumb img 资源地址可能是一样的，所以比较 extraLabel 就可以
                return message.extraLabel?.endsWith(quotedMessage.extraLabel!)
              } else {
                // Photo, GIF, Video 只能通过尝试比对资源地址和 message text 内容
                const quotedMediaMessageContent = quotedMessage.content
                const omitted = quotedMessage.content.length > 100
                if (omitted) {
                  quotedMediaMessageContent.replace(/\.\.\.$/, '')
                }
                return (
                  message.extraLabel?.endsWith(quotedMessage.extraLabel!) ||
                  (omitted
                    ? message.content.startsWith(quotedMediaMessageContent)
                    : message.content === quotedMediaMessageContent)
                )
              }
            } else {
              // 100 text limit is from tweb(https://github.com/morethanwords/tweb/blob/b6486ad81d7523284affd4900bcd2663da079e4e/src/components/wrappers/messageForReply.ts#L275)
              return quotedMessage.content.length > 100
                ? message.content
                    .replaceAll('\n', ' ')
                    .startsWith(
                      quotedMessage.content
                        .replace(/\.\.\.$/, '')
                        .replaceAll('\n', ' '),
                    )
                : message.content.replaceAll('\n', ' ') ===
                    quotedMessage.content.replaceAll('\n', ' ')
            }
          }
          return false
        })

        // 找不到 quoted message，有可能是：
        // 1. 在聊天记录里面被虚拟列表刷走了
        // 2. 没获取到正确的 username 的 message
        // 3. 没被适配到的 quoted message
        if (replyMessageBoxIndex === -1) {
          replyMessageBoxIndex = Infinity
          replyUnfoundQuotedMessage = {
            ...quotedMessage,
            datetime: '',
          }
        }
      } else {
        replyMessageBoxIndex = chatMessages.findLastIndex(
          (message) => message.user !== configs.username,
        )
      }
    }

    if (chatMessages.length) {
      if (replyMessageBoxIndex === Infinity) {
        if (replyUnfoundQuotedMessage) {
          const chatMessagesContext = new ChatMessagesContext(
            chatMessages,
            configs,
          )
          chatMessagesContext.replyMessage(replyUnfoundQuotedMessage)
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

export const telegramGetDraftContent = (inputAssistantButton: HTMLElement) => {
  const telegramDraftEditor = findSelectorParent(
    '.input-message-input[data-peer-id]',
    inputAssistantButton,
    2,
  )
  return telegramDraftEditor?.innerText || ''
}
