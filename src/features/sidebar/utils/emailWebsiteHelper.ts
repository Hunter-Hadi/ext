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
    website: 'mail.proton.me',
    traffic: 0.54,
  },
  {
    website: 'icloud.com',
    traffic: 0.51,
  },
  {
    website: 'mail.zoho.com',
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
  {
    website: 'wx.mail.qq.com',
    traffic: 0.36,
  },
]
export const emailWebsites = emailWebsiteTrafficRankings.map(
  (item) => item.website,
)
export const isEmailWebsite = () => {
  return emailWebsites.includes(getCurrentDomainHost())
}

export const getEmailWebsitePageContent = async () => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))
  const host = getCurrentDomainHost()
  let hasMore = false
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
  if (host === 'wx.mail.qq.com') {
    emailContextSelector = 'div.container'
  }
  if (host === 'mail.proton.me') {
    document
      .querySelectorAll('div.scroll-inner .message-header')
      .forEach((item) => {
        hasMore = true
        ;(item as HTMLElement).click()
      })
    emailContextSelector = 'div.scroll-inner'
  }
  if (host === 'mail.zoho.com') {
    document
      .querySelectorAll('div.zmPVContent .zmTMailList .zmMHdrSumContent')
      .forEach((emailItem) => {
        hasMore = true
        ;(emailItem as HTMLElement).click()
      })
    emailContextSelector = 'div.zmPVContent'
  }
  if (hasMore) {
    await delay(3000)
  }
  const pageContent = (
    (document.querySelector(emailContextSelector) ||
      document.body) as HTMLElement
  ).innerText
  return pageContent
}
