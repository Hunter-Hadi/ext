import { getCurrentDomainHost } from '@/utils'
import {
  IInputAssistantButton,
  IInputAssistantButtonGroupConfig,
} from '@/features/contextMenu/components/InputAssistantButton/config'
import { getTwitterInputAssistantButtonRootContainer } from '@/features/shortcuts/utils/socialMedia/platforms/twitter'
import { findSelectorParent } from '@/features/shortcuts/utils/socialMedia/platforms/utils'

type getInputAssistantButtonGroupWithHostConfig = {
  keyElement: HTMLElement
  buttonGroupConfig: IInputAssistantButtonGroupConfig
}

const checkHostUsingButtonKeys = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const host = getCurrentDomainHost()
  if (host === 'mail.google.com') {
    return getGmailButtonGroup(config)
  }
  if (
    host === 'outlook.office.com' ||
    host === 'outlook.live.com' ||
    host === 'outlook.office365.com'
  ) {
    return getOutlookButtonGroup(config)
  }
  if (host === 'twitter.com') {
    return getTwitterButtonGroup(config)
  }
  if (host === 'linkedin.com') {
    return getLinkedInButtonGroup(config)
  }
  if (host === 'facebook.com') {
    return getFacebookButtonGroup(config)
  }
  if (host === 'youtube.com') {
    return [
      config.buttonGroupConfig.composeReplyButton,
      config.buttonGroupConfig.refineDraftButton,
    ]
  }
  if (host === 'studio.youtube.com') {
    return [
      config.buttonGroupConfig.composeReplyButton,
      config.buttonGroupConfig.refineDraftButton,
    ]
  }
  if (host === 'instagram.com') {
    return getInstagramButtonGroup(config)
  }
  return [
    config.buttonGroupConfig.composeReplyButton,
    config.buttonGroupConfig.refineDraftButton,
  ]
}

const getGmailButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
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
    (editPanelElement.querySelector(
      'input[maxlength="255"]',
    ) as HTMLInputElement)?.value || ''
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
  const rooContainer = getTwitterInputAssistantButtonRootContainer(keyElement)
  if (rooContainer?.querySelector('article[data-testid="tweet"]')) {
    return [
      buttonGroupConfig.composeReplyButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  const detailPostPage = (Array.from(
    document.querySelectorAll('article[data-testid="tweet"]'),
  ) as HTMLElement[]).find((post) => {
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
  const isForm = findSelectorParent('form[method="POST"]', keyElement, 20)
  if (isForm) {
    return [
      buttonGroupConfig.composeNewButton,
      buttonGroupConfig.refineDraftButton,
    ]
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

const getInstagramButtonGroup = (
  config: getInputAssistantButtonGroupWithHostConfig,
): IInputAssistantButton[] => {
  const { keyElement, buttonGroupConfig } = config
  const isForm = findSelectorParent(
    'div[contenteditable="true"]',
    keyElement,
    20,
  )
  if (isForm) {
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
export default checkHostUsingButtonKeys
