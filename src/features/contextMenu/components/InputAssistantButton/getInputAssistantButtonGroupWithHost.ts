import {
  IInputAssistantButton,
  IInputAssistantButtonGroupConfig,
} from '@/features/contextMenu/components/InputAssistantButton/config'
import { getTwitterInputAssistantButtonRootContainer } from '@/features/shortcuts/utils/socialMedia/platforms/twitter'
import {
  findParentEqualSelector,
  findSelectorParent,
} from '@/features/shortcuts/utils/socialMedia/platforms/utils'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

type getInputAssistantButtonGroupWithHostConfig = {
  keyElement: HTMLElement
  buttonGroupConfig: IInputAssistantButtonGroupConfig
}

const checkHostUsingButtonKeys = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const host = getCurrentDomainHost()
  switch (host) {
    // email
    case 'mail.google.com':
      return getGmailButtonGroup(config)

    case 'outlook.office.com':
    case 'outlook.live.com':
    case 'outlook.office365.com':
      return getOutlookButtonGroup(config)

    // social media
    case 'twitter.com':
      return getTwitterButtonGroup(config)

    case 'linkedin.com':
      return getLinkedInButtonGroup(config)

    case 'facebook.com':
      return getFacebookButtonGroup(config)

    case 'youtube.com':
    case 'studio.youtube.com':
      return getYouTubeButtonGroup(config)

    case 'instagram.com':
      return getInstagramButtonGroup(config)

    case 'reddit.com':
      return getRedditButtonGroup(config)

    // chat
    case 'discord.com':
      return getDiscordButtonGroup(config)

    case 'app.slack.com':
      return getSlackButtonGroup(config)

    case 'web.whatsapp.com':
      return getWhatsAppButtonGroup(config)

    default:
      return [
        config.buttonGroupConfig.composeReplyButton,
        config.buttonGroupConfig.refineDraftButton,
      ]
  }
}

const getGmailButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  // temp fix for gmail
  if (keyElement.classList.contains('amn')) {
    return [buttonGroupConfig.composeReplyButton]
  }
  const emailMessageList = document.querySelectorAll('div[data-message-id]')
  for (let i = 0; i < emailMessageList.length; i++) {
    const emailMessageElement = emailMessageList[i]
    if (emailMessageElement.nextElementSibling?.contains(keyElement)) {
      return [
        buttonGroupConfig.composeReplyButton,
        buttonGroupConfig.refineDraftButton,
      ]
    }
  }
  return [
    buttonGroupConfig.composeNewButton,
    buttonGroupConfig.refineDraftButton,
  ]
}
const getOutlookButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  // temp fix for outlook mail
  if (keyElement.classList.contains('th6py')) {
    return [buttonGroupConfig.composeReplyButton]
  }
  const listContainer = document.querySelector(
    'div[data-app-section="ConversationContainer"]',
  ) as HTMLDivElement
  const editPanelElement = document.querySelector(
    '#ReadingPaneContainerId',
  ) as HTMLElement
  const toOrCC = editPanelElement.querySelectorAll(
    'div[role="textbox"]:has(#removeButton)',
  ).length
  const fwdMsg =
    editPanelElement.querySelector('#RplyFwdMsg') ||
    editPanelElement.querySelector('#divRplyFwdMsg')
  const isDialog = Array.from(
    document.querySelectorAll('div[role="dialog"]'),
  ).find((modal) => modal.contains(keyElement))
  const subject =
    (
      editPanelElement.querySelector(
        'input[maxlength="255"]',
      ) as HTMLInputElement
    )?.value || ''
  // 1. 不在列表
  // 2. 没有toOrCC的用户
  // 3. 没有fwdMsg
  // 4. 不在dialog中
  if (
    !listContainer?.contains(keyElement) &&
    toOrCC === 0 &&
    !fwdMsg &&
    !isDialog &&
    !subject
  ) {
    return [
      buttonGroupConfig.composeNewButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  return [
    buttonGroupConfig.composeReplyButton,
    buttonGroupConfig.refineDraftButton,
  ]
}
const getTwitterButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  const rootContainer = getTwitterInputAssistantButtonRootContainer(keyElement)
  if (keyElement?.parentElement?.getAttribute('data-testid') !== 'toolBar') {
    return [buttonGroupConfig.composeReplyButton]
  }
  if (rootContainer?.querySelector('article[data-testid="tweet"]')) {
    return [
      buttonGroupConfig.composeReplyButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  const detailPostPage = (
    Array.from(
      document.querySelectorAll('article[data-testid="tweet"]'),
    ) as HTMLElement[]
  ).find((post) => {
    return post.nextElementSibling?.contains(keyElement)
  })
  if (detailPostPage) {
    return [
      buttonGroupConfig.composeReplyButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  return [
    buttonGroupConfig.composeNewButton,
    buttonGroupConfig.refineDraftButton,
  ]
}

const getLinkedInButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  if (
    keyElement.classList.contains('feed-shared-social-action-bar') ||
    keyElement.classList.contains('comments-comment-social-bar')
  ) {
    return [buttonGroupConfig.composeReplyButton]
  }
  if (keyElement.classList.contains('share-box_actions')) {
    return [
      buttonGroupConfig.composeNewButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  return [
    buttonGroupConfig.composeReplyButton,
    buttonGroupConfig.refineDraftButton,
  ]
}

const getFacebookButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  // Facebook Reels
  const isFacebookReelPage = findParentEqualSelector(
    'div:has(div>div[data-pagelet="Reels"]) + div > div:nth-child(1) > div:nth-child(1) > div:nth-child(1):not([aria-label])',
    keyElement,
  )
  if (isFacebookReelPage) {
    return [buttonGroupConfig.composeReplyButton]
  }
  const isCreatingPost = findSelectorParent(
    'form[method="POST"]',
    keyElement,
    20,
  )
  if (isCreatingPost) {
    return [
      buttonGroupConfig.composeNewButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  const isCommentForm = findSelectorParent(
    'form[role="presentation"]',
    keyElement,
    20,
  )?.contains(keyElement)
  if (isCommentForm) {
    return [
      buttonGroupConfig.composeReplyButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  const isExplicitToolbar = findParentEqualSelector(
    'div[data-visualcompletion="ignore-dynamic"]',
    keyElement,
  )
  if (isExplicitToolbar) {
    return [buttonGroupConfig.composeReplyButton]
  }

  const isReplyComment = findParentEqualSelector(
    'div[role="article"][aria-label]',
    keyElement,
    5,
  )
  if (isReplyComment) {
    return [buttonGroupConfig.composeReplyButton]
  }
  const replyForm = findSelectorParent('form[role="presentation"]', keyElement)
  if (replyForm?.getBoundingClientRect().width < 240) {
    // 宽度不够
    return []
  }

  return [
    buttonGroupConfig.composeReplyButton,
    buttonGroupConfig.refineDraftButton,
  ]
}

const getYouTubeButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  if (
    keyElement.id === 'placeholder-area' ||
    keyElement.id === 'reply-button-end'
  ) {
    return [buttonGroupConfig.composeReplyButton]
  }
  return [
    buttonGroupConfig.composeReplyButton,
    buttonGroupConfig.refineDraftButton,
  ]
}

const getInstagramButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  const inTheForm = findSelectorParent(
    'div[contenteditable="true"]',
    keyElement,
    20,
  )
  const isCreateDialog = findParentEqualSelector(
    'div[aria-label][role="dialog"]',
    inTheForm,
  )
  if (inTheForm && isCreateDialog) {
    return [
      buttonGroupConfig.composeNewButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  return [
    buttonGroupConfig.composeReplyButton,
    buttonGroupConfig.refineDraftButton,
  ]
}

const getRedditButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  if (keyElement.querySelector('slot[name="submit-button"]')) {
    // reply
    return [
      buttonGroupConfig.composeReplyButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  return [
    buttonGroupConfig.composeNewButton,
    buttonGroupConfig.refineDraftButton,
  ]
}

const getDiscordButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  if (keyElement?.matches('[class^="buttonsInner"]')) {
    return [buttonGroupConfig.composeReplyButton]
  }
  return [
    buttonGroupConfig.composeReplyButton,
    buttonGroupConfig.refineDraftButton,
  ]
}

const getSlackButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  if (
    keyElement?.matches(
      '[data-qa="message-actions"]:has(> [data-qa="start_thread"][aria-keyshortcuts="t"])',
    )
  ) {
    return [buttonGroupConfig.composeReplyButton]
  }
  return [
    buttonGroupConfig.composeReplyButton,
    buttonGroupConfig.refineDraftButton,
  ]
}

const getWhatsAppButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  // if (
  //   keyElement?.matches(
  //     '[data-qa="message-actions"]:has(> [data-qa="start_thread"][aria-keyshortcuts="t"])',
  //   )
  // ) {
  //   return [buttonGroupConfig.composeReplyButton]
  // }
  return [
    buttonGroupConfig.composeReplyButton,
    buttonGroupConfig.refineDraftButton,
  ]
}

export default checkHostUsingButtonKeys
