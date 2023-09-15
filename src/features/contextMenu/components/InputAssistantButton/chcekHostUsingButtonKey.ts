import { IChromeExtensionButtonSettingKey } from '@/background/types/Settings'
import { getCurrentDomainHost } from '@/utils'

type CheckHostUsingButtonKeysConfig = {
  keyElement: HTMLElement
}

const checkHostUsingButtonKeys = (
  config: CheckHostUsingButtonKeysConfig,
): IChromeExtensionButtonSettingKey[] => {
  const host = getCurrentDomainHost()
  if (host === 'mail.google.com') {
    return getGmailButtonKey(config)
  }
  return []
}

const getGmailButtonKey = (
  config: CheckHostUsingButtonKeysConfig,
): IChromeExtensionButtonSettingKey[] => {
  const emailMessageList = document.querySelectorAll('div[data-message-id]')
  for (let i = 0; i < emailMessageList.length; i++) {
    const emailMessageElement = emailMessageList[i]
    if (emailMessageElement.nextElementSibling?.contains(config.keyElement)) {
      return ['inputAssistantReplyButton', 'inputAssistantEditButton']
    }
  }
  return ['inputAssistantDraftNewButton', 'inputAssistantEditButton']
}
export default checkHostUsingButtonKeys
