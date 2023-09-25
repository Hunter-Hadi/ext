import { getCurrentDomainHost } from '@/utils'
import { ContextMenuNamePrefixType } from '@/features/shortcuts/utils/ContextMenuNamePrefixList'

const getContextMenuNamePrefixWithHost = (): ContextMenuNamePrefixType => {
  const host = getCurrentDomainHost()
  if (host === 'mail.google.com') {
    return '[Gmail] '
  } else if (
    host === 'outlook.office.com' ||
    host === 'outlook.live.com' ||
    host === 'outlook.office365.com'
  ) {
    return '[Outlook] '
  } else if (host === 'twitter.com') {
    return '[Twitter] '
  }
  return '' as ContextMenuNamePrefixType
}
export default getContextMenuNamePrefixWithHost
