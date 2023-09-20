import { getCurrentDomainHost } from '@/utils'
import {
  IInputAssistantButton,
  IInputAssistantButtonGroupConfig,
} from '@/features/contextMenu/components/InputAssistantButton/config'

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
  if (host === 'outlook.office.com' || host === 'outlook.live.com') {
    return getOutlookButtonGroup(config)
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
    '#div[role="textbox"]:has(#removeButton)',
  ).length
  const fwdMsg = editPanelElement.querySelector('#RplyFwdMsg')
  const isDialog = Array.from(
    document.querySelectorAll('div[role="dialog"]'),
  ).find((modal) => modal.contains(keyElement))
  // 1. 不在列表
  // 2. 没有toOrCC的用户
  // 3. 没有fwdMsg
  // 4. 不在dialog中
  if (
    !listContainer?.contains(keyElement) &&
    toOrCC === 0 &&
    !fwdMsg &&
    !isDialog
  ) {
    return [
      buttonGroupConfig.composeNewButton,
      buttonGroupConfig.refineDraftButton,
    ]
  }
  return [
    config.buttonGroupConfig.composeReplyButton,
    config.buttonGroupConfig.refineDraftButton,
  ]
}
export default checkHostUsingButtonKeys
