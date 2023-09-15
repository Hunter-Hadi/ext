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
  return []
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
export default checkHostUsingButtonKeys
