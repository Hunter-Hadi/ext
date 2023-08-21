import { getCurrentDomainHost } from '@/utils'

export const emailWebsiteTrafficRankings = [
  {
    website: 'mail.google.com',
    traffic: 4.57,
  },
  {
    website: 'mail.yahoo.com',
    traffic: 1.79,
  },
  {
    website: 'outlook.live.com',
    traffic: 1.63,
  },
  {
    website: 'mail.com',
    traffic: 1.51,
  },
  {
    website: 'aol.com',
    traffic: 1.07,
  },
  {
    website: 'gmx.com',
    traffic: 0.97,
  },
  {
    website: 'hotmail.com',
    traffic: 0.86,
  },
  {
    website: 'yandex.com',
    traffic: 0.65,
  },
  {
    website: 'protonmail.com',
    traffic: 0.54,
  },
  {
    website: 'icloud.com',
    traffic: 0.51,
  },
  {
    website: 'zoho.com',
    traffic: 0.45,
  },
  {
    website: 'tutanota.com',
    traffic: 0.4,
  },
  {
    website: 'inbox.com',
    traffic: 0.39,
  },

  {
    website: 'mail.qq.com',
    traffic: 0.37,
  },
]
export const emailWebsites = emailWebsiteTrafficRankings.map(
  (item) => item.website,
)
export const isEmailWebsite = () => {
  return emailWebsites.includes(getCurrentDomainHost())
}

export const getEmailWebsitePageContent = () => {
  const host = getCurrentDomainHost()
  let emailContextSelector = 'body'
  if (host === 'mail.google.com') {
    emailContextSelector = 'div[role="list"]'
  }
  if (host === 'outlook.live.com') {
    emailContextSelector = 'div[data-app-section="ConversationContainer"]'
  }
  if (host === 'mail.yahoo.com') {
    emailContextSelector = 'div[data-test-id="message-group-view-scroller"]'
  }
  const pageContent = (
    (document.querySelector(emailContextSelector) ||
      document.body) as HTMLElement
  ).innerText
  return pageContent
}
