import { getCurrentDomainHost } from '@/utils'

const getContextMenuNamePrefixWithHost = () => {
  const host = getCurrentDomainHost()
  if (host === 'mail.google.com') {
    return '[Gmail] '
  } else if (
    host === 'outlook.office.com' ||
    host === 'outlook.live.com' ||
    host === 'outlook.office365.com'
  ) {
    return '[Outlook] '
  }
  return ''
}
export default getContextMenuNamePrefixWithHost
