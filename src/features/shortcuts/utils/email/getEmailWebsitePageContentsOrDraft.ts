import { getCurrentDomainHost } from '@/utils'
import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'
import { removeEmailContentQuote } from '@/features/shortcuts/utils/email/removeEmailContentQuote'

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
    website: 'outlook.office365.com',
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
    } else if (currentHost === 'outlook.office365.com') {
      return window.location.href.includes('outlook.office365.com')
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
  if (
    host === 'outlook.office.com' ||
    host === 'outlook.live.com' ||
    host === 'outlook.office365.com'
  ) {
    const maxDeep = 20
    let parent: HTMLElement | null = button.parentElement as HTMLElement
    let textboxElement: HTMLElement | null = null
    let deep = 0
    while (!textboxElement && deep < maxDeep) {
      parent = parent?.parentElement as HTMLElement
      textboxElement =
        (parent?.querySelector(
          'div[role="textbox"][textprediction]',
        ) as HTMLElement) ||
        (parent?.querySelector(
          'div[id] > div[role="textbox"]',
        ) as HTMLElement) ||
        null
      deep++
    }
    return textboxElement ? removeEmailContentQuote(textboxElement) : ''
  }
  try {
    if (emailDraftSelector) {
      const draft = documentElement.querySelector(
        emailDraftSelector,
      ) as HTMLElement
      return removeEmailContentQuote(draft)
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
  sortEmails() {
    this.emails.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
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
        .replace(/\n{2,}/g, '\n\n')
    )
  }
}

const fireClick = (node: any): void => {
  if (document.createEvent) {
    const evt = document.createEvent('MouseEvents')
    evt.initEvent('click', true, false)
    node.dispatchEvent(evt)
  } else if (typeof node.onclick === 'function') {
    node.onclick()
  }
}

export const getEmailWebsitePageContentsOrDraft = async (
  inputAssistantButtonElementSelector?: string,
) => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms))
  const host = getCurrentDomainHost()
  const emailRegex = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/g
  let hasMore = false
  let iframeSelector = ''
  let emailContextSelector = 'body'
  const inputAssistantButtonElement =
    (inputAssistantButtonElementSelector &&
      (document.querySelector(
        inputAssistantButtonElementSelector,
      ) as HTMLButtonElement)) ||
    null
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
            (messageItem as HTMLElement).contains(inputAssistantButtonElement)
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
                userEmail =
                  item?.getAttribute('aria-label')?.match(emailRegex)?.[0] || ''
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
  if (
    host === 'outlook.office.com' ||
    host === 'outlook.live.com' ||
    host === 'outlook.office365.com'
  ) {
    // outlook 有3种回复邮件的UI: 列表框展开回复 | 邮件详情页回复 | 弹窗邮件详情页回复 | 弹窗邮件详情页回复新邮件
    // 1. 列表框展开回复判断条件:
    //    1.1 列表容器document.querySelector('div[data-app-section="ConversationContainer"]')存在
    //    1.2 inputAssistantButtonElement在列表容器里
    // 2. 弹窗邮件详情页回复判断条件:
    //    2.1 没有列表容器
    //    2.2 inputAssistantButtonElement在列表容器里
    //    2.3 判断有没有弹窗内的邮件元素框: document.querySelectorAll('div[role="dialog"] div[role="textbox"]')
    // 3. 邮件详情页回复判断条件:
    //    3.1 没有列表容器
    //    3.2 没有弹窗元素框
    //    3.3 inputAssistantButtonElement在列表容器里
    //    3.4 判断邮件元素框存在, document.querySelector('#ReadingPaneContainerId div[id] > div[role="textbox"]')
    try {
      const subject =
        document.querySelector(
          '#ReadingPaneContainerId div[role="heading"][aria-level="2"]',
        )?.textContent || document.title

      const expandMoreButton = document.querySelector(
        'div[role="button"][aria-label="See more messages"]',
      ) as HTMLButtonElement
      expandMoreButton?.click()
      // ======================== 1.列表框展开回复 ========================
      // 邮件列表容器
      const rootElement = document.querySelector(
        'div[data-app-section="ConversationContainer"]',
      ) as HTMLDivElement
      if (rootElement && rootElement.contains(inputAssistantButtonElement)) {
        const emailCorrespondence = new EmailCorrespondence()
        const messageItems: Element[] = []
        const totalMessageItems = Array.from(
          rootElement.querySelectorAll('& > div > div'),
        ) as HTMLElement[]
        // 因为outlook可以修改邮件顺序，所以要先拿到邮件的date
        const replyMessageDate =
          totalMessageItems
            .find((messageItem) =>
              messageItem.contains(inputAssistantButtonElement),
            )
            ?.querySelector('div[data-testid="SentReceivedSavedTime"]')
            ?.textContent || ''
        // 插入时间比replyMessageDate小的message
        totalMessageItems.forEach((messageItem) => {
          const messageDate =
            messageItem.querySelector(
              'div[data-testid="SentReceivedSavedTime"]',
            )?.textContent || ''
          if (
            new Date(messageDate).getTime() <=
            new Date(replyMessageDate).getTime()
          ) {
            messageItems.push(messageItem)
          }
          const expandMessages = messageItem.querySelectorAll('& > div > div')
          expandMessages.forEach((expandMessage) => fireClick(expandMessage))
        })
        const profileButton = document.querySelector(
          '#meInitialsButton',
        ) as HTMLButtonElement
        while (!document.querySelector('#mectrl_currentAccount_primary')) {
          profileButton.click()
          await delay(2000)
        }
        const userName =
          document.querySelector('#mectrl_currentAccount_primary')
            ?.textContent || ''
        const userEmail =
          document.querySelector('#mectrl_currentAccount_secondary')
            ?.textContent || ''
        // 寻找sender和receiver
        for (let i = 0; i < messageItems.length; i++) {
          const emailEmailElements = Array.from(
            messageItems[i].querySelectorAll('span[data-lpc-hover-target-id]'),
          )
          const receiverElement = messageItems[i].querySelector(
            'div[data-testid="RecipientWell"]',
          )
          if (!receiverElement || emailEmailElements.length === 0) {
            continue
          }
          const date =
            messageItems[i].querySelector(
              'div[data-testid="SentReceivedSavedTime"]',
            )?.textContent || ''
          const content = removeEmailContentQuote(
            (messageItems[i].querySelector('#UniqueMessageBody') ||
              messageItems[i].querySelector(
                'div[role="document"]',
              )) as HTMLDivElement,
          )
          // 因为outlook的html中，用户本身的邮件是不带邮件地址的，所以只能先判断有没有邮件，再判断是不是接受者
          emailEmailElements.find((emailElement) => {
            const emailElementContext = emailElement.textContent || ''
            let email = emailElementContext.match(emailRegex)?.[0]
            if (
              !email &&
              emailElementContext === emailCorrespondence.sender?.name
            ) {
              email = emailCorrespondence.sender.email
            } else if (
              !email &&
              emailElementContext === emailCorrespondence.receiver?.name
            ) {
              email = emailCorrespondence.receiver.email
            }
            if (email) {
              let isReceiver = false
              if (receiverElement?.contains(emailElement)) {
                isReceiver = true
              }
              const name = emailElementContext.replace(` <${email}>`, '')
              if (name && email) {
                // 如果没有设置sender和receiver，就设置
                if (
                  !emailCorrespondence.receiver ||
                  !emailCorrespondence.sender
                ) {
                  if (isReceiver) {
                    emailCorrespondence.addReceiver({
                      name,
                      email,
                    })
                    emailCorrespondence.addSender({
                      name: userName,
                      email: userEmail,
                    })
                  } else {
                    emailCorrespondence.addSender({
                      name,
                      email,
                    })
                    emailCorrespondence.addReceiver({
                      name: userName,
                      email: userEmail,
                    })
                  }
                }
                if (isReceiver) {
                  const theMessageSenderEmail =
                    emailCorrespondence.sender?.email === email
                      ? emailCorrespondence.receiver!.email
                      : emailCorrespondence.sender!.email
                  emailCorrespondence.addEmail(theMessageSenderEmail, {
                    date,
                    subject,
                    content,
                  })
                } else {
                  emailCorrespondence.addEmail(email, {
                    date,
                    subject,
                    content,
                  })
                }
                return true
              }
            }
            return false
          })
        }
        emailCorrespondence.sortEmails()
        if (emailCorrespondence.emails.length > 0) {
          return emailCorrespondence.formatText()
        }
        emailContextSelector = 'div[data-app-section="ConversationContainer"]'
      }
      // 因为接下来对单个邮件的处理都一样，这里封装一下
      const getSingleEmailText = (originElement: HTMLElement) => {
        let currentOriginElement: HTMLElement = originElement
        let count = 0
        while (
          !currentOriginElement.querySelector('#divRplyFwdMsg') &&
          !currentOriginElement.querySelector('#divRplyFwdMsg') &&
          count < 10
        ) {
          count++
          currentOriginElement = currentOriginElement.parentElement as HTMLElement
        }
        const emailContentElement = currentOriginElement.cloneNode(
          true,
        ) as HTMLElement
        const emailCorrespondence = new EmailCorrespondence()
        const emailInfoElement =
          (emailContentElement.querySelector(
            '#divRplyFwdMsg',
          ) as HTMLDivElement) ||
          (emailContentElement.querySelector('#RplyFwdMsg') as HTMLDivElement)
        const emailQuoteElement = emailInfoElement?.nextElementSibling as HTMLDivElement
        if (emailInfoElement && emailQuoteElement) {
          const textNodeList = Array.from(
            emailInfoElement.querySelector('font')?.childNodes || [],
          ).filter((item) => !(item as HTMLElement).tagName)
          // 顺序分别是 From, Sent, To, Subject
          if (textNodeList.length === 4) {
            const fromEmail = textNodeList[0].textContent?.match(
              emailRegex,
            )?.[0]
            const fromName = textNodeList[0].textContent?.replace(
              ` <${fromEmail}>`,
              '',
            )
            const toEmail = textNodeList[2].textContent?.match(emailRegex)?.[0]
            const toName = textNodeList[2].textContent?.replace(
              ` <${toEmail}>`,
              '',
            )
            const date = textNodeList[1].textContent || ''
            const subject = textNodeList[3].textContent || ''

            if (fromEmail && fromName && toEmail && toName && date && subject) {
              emailCorrespondence.addSender({
                email: fromEmail,
                name: fromName,
              })
              emailCorrespondence.addReceiver({
                email: toEmail,
                name: toName,
              })
              emailInfoElement.remove()
              const content = removeEmailContentQuote(emailQuoteElement)
              emailCorrespondence.addEmail(fromEmail, {
                date,
                subject,
                content,
              })
              return emailCorrespondence.formatText()
            }
          }
        }
        return ''
      }
      // ======================== 2.弹窗邮件详情页回复 ========================
      const modalEmailContextElement =
        (document.querySelector(
          'div[role="dialog"] div[role="textbox"][textprediction]',
        ) as HTMLDivElement) ||
        (document.querySelector(
          'div[role="dialog"] div[id] > div[role="textbox"]',
        ) as HTMLDivElement)
      const modalElement = (Array.from(
        document.querySelectorAll('div[role="dialog"]'),
      ) as HTMLDivElement[]).find((modalElement) =>
        modalElement.contains(modalEmailContextElement),
      )
      if (modalElement && modalElement.contains(inputAssistantButtonElement)) {
        const emailContext = getSingleEmailText(modalEmailContextElement)
        if (emailContext) {
          return emailContext
        }
        emailContextSelector = '#ReadingPaneContainerId'
      }
      // ======================== 3.邮件详情页回复 ========================
      const detailEmailContextElement = document.querySelector(
        '#ReadingPaneContainerId div[id] > div[role="textbox"]',
      ) as HTMLDivElement
      const detailEmailRootElement = document.querySelector(
        '#ReadingPaneContainerId',
      ) as HTMLDivElement
      if (detailEmailRootElement?.contains(inputAssistantButtonElement)) {
        const emailContext = getSingleEmailText(detailEmailContextElement)
        if (emailContext) {
          return emailContext
        }
        emailContextSelector = '#ReadingPaneContainerId'
      }
    } catch (e) {
      emailContextSelector = 'div[data-app-section="ConversationContainer"]'
    }
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
    documentElements = (Array.from(
      document.querySelectorAll(iframeSelector),
    ) as any) as HTMLElement[]
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
