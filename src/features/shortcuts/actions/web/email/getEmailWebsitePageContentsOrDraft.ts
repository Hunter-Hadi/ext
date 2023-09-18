import { getCurrentDomainHost } from '@/utils'
import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'
import { removeEmailContentQuote } from '@/features/shortcuts/actions/web/email/removeEmailContentQuote'

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
    website: 'outlook.office.com',
    traffic: 1.63,
  },
  {
    website: 'navigator-lxa.mail.com',
    traffic: 1.51,
  },
  // {
  //   website: 'mail.aol.com',
  //   traffic: 1.07,
  // },
  // {
  //   website: 'gmx.com',
  //   traffic: 0.97,
  // },
  // {
  //   website: 'yandex.com',
  //   traffic: 0.65,
  // },
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
  // {
  //   website: 'tutanota.com',
  //   traffic: 0.4,
  // },
  // {
  //   website: 'inbox.com',
  //   traffic: 0.39,
  // },
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
  const currentHost = getCurrentDomainHost()
  const isEmailWebsite = emailWebsites.includes(currentHost)
  if (isEmailWebsite) {
    if (currentHost === 'icloud.com') {
      return window.location.href.includes('icloud.com/mail')
    } else if (currentHost === 'outlook.live.com') {
      return window.location.href.includes('outlook.live.com/mail')
    } else if (currentHost === 'outlook.office.com') {
      return window.location.href.includes('outlook.office.com/mail')
    }
    return true
  }
  return false
}

export const getEmailWebsitePageDraft = async (
  inputAssistantButtonElementSelector: string,
) => {
  const button = document.querySelector(
    inputAssistantButtonElementSelector,
  ) as HTMLButtonElement
  const host = getCurrentDomainHost()
  let emailDraftSelector = ''
  let documentElement: HTMLElement = document.documentElement
  if (host === 'mail.google.com') {
    // document.querySelectorAll('table[role="presentation"][id] div[role="textbox"]')[1].innerText
    document.querySelectorAll('table[role="presentation"]').forEach((table) => {
      if (table.contains(button)) {
        documentElement = table as HTMLTableElement
      }
    })
    emailDraftSelector = 'div[role="textbox"]'
  }
  try {
    if (emailDraftSelector) {
      const draft = documentElement.querySelector(
        emailDraftSelector,
      ) as HTMLElement
      return draft?.innerText?.trim() || ''
    }
    return ''
  } catch (e) {
    return ''
  }
}

class EmailCorrespondence {
  sender?: {
    email: string
    name: string
  }
  receiver?: {
    email: string
    name: string
  }
  emails: Array<{
    from: {
      email: string
      name: string
    }
    to: {
      email: string
      name: string
    }
    date: string
    subject: string
    content: string
  }>
  constructor() {
    this.emails = []
  }
  addSender(sender: { email: string; name: string }) {
    this.sender = sender
  }
  addReceiver(receiver: { email: string; name: string }) {
    this.receiver = receiver
  }
  addEmail(
    email: string,
    emailContent: {
      date: string
      subject: string
      content: string
    },
  ) {
    if (this.sender && this.receiver) {
      if (email === this.sender?.email) {
        this.emails.push({
          from: this.sender,
          to: this.receiver,
          ...emailContent,
        })
      } else {
        this.emails.push({
          from: this.receiver,
          to: this.sender,
          ...emailContent,
        })
      }
    }
  }
  formatText() {
    return (
      this.emails
        .map((email, index) => {
          // ## Email #1
          // **From:** Sender Name<sender@domain.com>
          // **To:** Receiver Name<receiver@domain.com>
          // **Date:** YYYY-MM-DD
          // **Subject:** Email Subject
          //
          // Email content goes here.
          //
          // ---
          return `## Email #${index + 1}\n**From:** ${email.from.name}<${
            email.from.email
          }>\n**To:** ${email.to.name}<${email.to.email}>\n**Date:** ${
            email.date
          }\n**Subject:** ${email.subject}\n\n${email.content}\n\n---\n`
        })
        .join('\n')
        // 这里是为了防止出现多个空行
        .replace(/\n{2,}/, '\n\n')
    )
  }
}
export const getEmailWebsitePageContentsOrDraft = async (
  inputAssistantButtonElementSelector?: string,
) => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))
  const host = getCurrentDomainHost()
  let hasMore = false
  let iframeSelector = ''
  let emailContextSelector = 'body'
  if (host === 'mail.google.com') {
    // 邮件列表容器
    const rootElement = document.querySelector(
      'div[role="list"]',
    ) as HTMLDivElement
    // 点击展开
    if (rootElement) {
      const emailCorrespondence = new EmailCorrespondence()
      const expandEmailButton = rootElement.querySelector(
        'span[role="button"][aria-expanded][tabindex="-1"]',
      ) as HTMLButtonElement
      if (expandEmailButton) {
        expandEmailButton.click()
        await delay(3000)
      }
      const messageItems: Element[] = []
      //如果发现了inputAssistantButtonElementSelector，就不用再找了
      Array.from(rootElement.querySelectorAll('div[role="listitem"]')).find(
        (messageItem) => {
          if (
            inputAssistantButtonElementSelector &&
            messageItem.querySelector(inputAssistantButtonElementSelector)
          ) {
            messageItems.push(messageItem)
            return true
          }
          messageItems.push(messageItem)
          return false
        },
      )
      // 寻找sender和receiver
      for (let i = 0; i < messageItems.length; i++) {
        if (messageItems[i].querySelectorAll('table span[email]').length >= 2) {
          // 因为展开的邮件才能看到Form和to
          const emails = Array.from(
            messageItems[i].querySelectorAll('table span[email]'),
          )
          let userEmail = ''
          document
            .querySelectorAll('a[aria-label][role="button"]')
            .forEach((item) => {
              //aria-label="Google アカウント: yang chen    (yangger666@gmail.com)"
              if (item?.getAttribute('aria-label')?.includes('@gmail.com')) {
                userEmail = (
                  item
                    ?.getAttribute('aria-label')
                    ?.match(/\(([^()]+@[^()]+\.[^()]+)\)/)?.[0] || ''
                ).replace(/\(|\)/g, '')
              }
            })
          const from = emails.find(
            (email) => email.getAttribute('email') === userEmail,
          )
          const to = emails.find(
            (email) => email.getAttribute('email') !== userEmail,
          )
          emailCorrespondence.addSender({
            email: from?.getAttribute('email') || '',
            name: from?.getAttribute('name') || '',
          })
          emailCorrespondence.addReceiver({
            email: to?.getAttribute('email') || '',
            name: to?.getAttribute('name') || '',
          })
          break
        }
      }
      const subject =
        document.querySelector('h2[data-thread-perm-id]')?.textContent ||
        document.title
      messageItems.forEach((messageItem) => {
        const currentMessage =
          messageItem.querySelector('div[data-message-id]') ||
          messageItem.querySelector('div[data-legacy-message-id]')
        const date =
          messageItem.querySelector('span[tabindex="-1"][alt]')?.textContent ||
          ''
        const currentMessageEmail =
          messageItem.querySelector('h3 span[email]')?.getAttribute('email') ||
          messageItem.querySelector('span[email]')?.getAttribute('email')
        if (currentMessageEmail) {
          if (currentMessage) {
            const content = removeEmailContentQuote(
              messageItem.querySelector(
                'div[id][jslog] > div[id]',
              ) as HTMLDivElement,
            )
            emailCorrespondence.addEmail(currentMessageEmail, {
              content,
              date,
              subject,
            })
          } else {
            const content =
              messageItem.querySelector('div[role="gridcell"] span')
                ?.textContent || ''
            emailCorrespondence.addEmail(currentMessageEmail, {
              content,
              date,
              subject,
            })
          }
        }
      })
      return emailCorrespondence.formatText()
    } else {
      emailContextSelector = 'div[role="list"]'
    }
  }
  if (host === 'outlook.live.com' || host === 'outlook.office.com') {
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
    iframeSelector = 'iframe[sandbox]'
    emailContextSelector = 'div#proton-root'
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
  let documentElements: HTMLElement[] = [document.documentElement]
  if (iframeSelector) {
    documentElements = Array.from(
      document.querySelectorAll(iframeSelector),
    ) as any as HTMLElement[]
  }
  try {
    const pageContent = (
      await Promise.all(
        documentElements.map(async (element) => {
          const doc: any =
            (element as any)?.contentDocument ||
            element?.ownerDocument ||
            document
          if (!doc?.querySelector) {
            return ''
          }
          const pageContent = doc.querySelector(
            emailContextSelector,
          ) as HTMLElement
          if (pageContent) {
            return pageContent.innerText
          } else {
            return await getPageContentWithMozillaReadability()
          }
        }),
      )
    ).join('')
    return pageContent
  } catch (e) {
    return await getPageContentWithMozillaReadability()
  }
}
