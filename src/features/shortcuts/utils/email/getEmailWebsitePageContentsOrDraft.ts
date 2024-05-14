import { InputAssistantButtonElementRouteMap } from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonManager'
import getPageContentWithMozillaReadability from '@/features/shortcuts/actions/web/ActionGetReadabilityContentsOfWebPage/getPageContentWithMozillaReadability'
import EmailCorrespondence, {
  type IEmailData,
  type IEmailUserData,
} from '@/features/shortcuts/utils/email/EmailContext'
import { removeEmailContentQuote } from '@/features/shortcuts/utils/email/removeEmailContentQuote'
import { wait } from '@/utils'
import { delayAndScrollToInputAssistantButton } from '@/utils/dataHelper/elementHelper'
import { getInstantReplyDataHelper } from '@/utils/dataHelper/instantReplyHelper'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

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

class DeprecatedEmailCorrespondence {
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
  get emailContext() {
    let targetReplyEmailContext = ''
    const emailContext = this.emails
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
        const emailContext = `## Email #${index + 1}\n**From:** ${
          email.from.name
        }<${email.from.email}>\n**To:** ${email.to.name}<${
          email.to.email
        }>\n**Date:** ${email.date}\n**Subject:** ${email.subject}\n\n${
          email.content
        }\n\n---\n`
        if (index === this.emails.length - 1) {
          // 这里是为了防止出现多个空行
          targetReplyEmailContext = emailContext.replace(/\n{2,}/g, '\n\n')
        }
        return emailContext
      })
      .join('\n')
      // 这里是为了防止出现多个空行
      .replace(/\n{2,}/g, '\n\n')
    return {
      targetReplyEmailContext,
      emailContext,
    }
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

const emailRegex = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/g

const getGmailUsers = (
  emailUserBoxes: NodeListOf<HTMLElement>,
): IEmailUserData[] => {
  // TODO - 只是为了代码能正常执行，原因是因为没有获取到正确的email和name
  if (emailUserBoxes.length === 0) {
    return [
      {
        email: '',
        name: '',
      },
    ]
  }

  const emails = Array.from(emailUserBoxes).map((userBox) => ({
    email: (
      userBox.getAttribute('email') ||
      userBox.getAttribute('data-hovercard-id') ||
      ''
    ).toLowerCase(),
    name:
      userBox.getAttribute('name') ||
      userBox.getAttribute('data-name') ||
      userBox.textContent ||
      '',
  }))

  return emails
}

// 因为接下来对单个邮件的处理都一样，这里封装一下
const outlookGetSingleEmailText = (originElement: HTMLElement | null) => {
  if (originElement) {
    let currentOriginElement: HTMLElement = originElement
    let count = 0
    while (
      !currentOriginElement.querySelector('#divRplyFwdMsg') &&
      count < 10
    ) {
      count++
      currentOriginElement = currentOriginElement.parentElement as HTMLElement
    }
    const emailContentElement = currentOriginElement.cloneNode(
      true,
    ) as HTMLElement
    const emailCorrespondence = new DeprecatedEmailCorrespondence()
    const emailInfoElement =
      (emailContentElement.querySelector('#divRplyFwdMsg') as HTMLDivElement) ||
      (emailContentElement.querySelector('#RplyFwdMsg') as HTMLDivElement)
    const emailQuoteElement =
      emailInfoElement?.nextElementSibling as HTMLDivElement
    if (emailInfoElement && emailQuoteElement) {
      const textNodeList = Array.from(
        emailInfoElement.querySelector('[style*="font"]')?.childNodes || [],
      ).filter((item) => !(item as HTMLElement).tagName)
      // 顺序分别是 From, Sent, To, Subject
      if (textNodeList.length === 4) {
        const fromEmail = textNodeList[0].textContent?.match(emailRegex)?.[0]
        const fromName = textNodeList[0].textContent?.replace(
          ` <${fromEmail}>`,
          '',
        )
        const toEmail = textNodeList[2].textContent?.match(emailRegex)?.[0]
        const toName = textNodeList[2].textContent?.replace(` <${toEmail}>`, '')
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
          return emailCorrespondence.emailContext
        }
      }
    }
  }
  return ''
}

// optimize WIP: need to test and cover all the cases
export const getEmailWebsitePageContentsOrDraft = async (
  inputAssistantButtonElementSelector: string,
): Promise<{ targetReplyEmailContext: string; emailContext: string }> => {
  // 优化：将上次获取的 context 缓存起来，然后判断
  //// - 1. 如果点的是和上次点的同一个 button
  //// - 2. 或者还是在同一个 context window 里进行操作
  // 那么通过直接返回上次缓存的 context 即可
  const instantReplyDataHelper = getInstantReplyDataHelper()
  const inputAssistantButtonElement =
    (inputAssistantButtonElementSelector &&
      ((InputAssistantButtonElementRouteMap.get(
        inputAssistantButtonElementSelector,
      ) ||
        document.querySelector(
          inputAssistantButtonElementSelector,
        )) as HTMLButtonElement)) ||
    null
  if (inputAssistantButtonElement) {
    const instantReplyButtonId = inputAssistantButtonElement.getAttribute(
      'maxai-input-assistant-button-id',
    )
    if (
      instantReplyDataHelper.getAttribute('aria-operation-selector-id') ===
      instantReplyButtonId
    ) {
      const fullContextCache = instantReplyDataHelper.getAttribute(
        'data-full-context-cache',
      )
      const targetContextCache = instantReplyDataHelper.getAttribute(
        'data-target-context-cache',
      )
      if (targetContextCache) {
        return {
          targetReplyEmailContext: targetContextCache,
          emailContext: fullContextCache || targetContextCache,
        }
      }
    }
    instantReplyDataHelper.setAttribute(
      'aria-operation-selector-id',
      instantReplyButtonId!,
    )
  }

  const host = getCurrentDomainHost()
  let hasMore = false
  let iframeSelector = ''
  let emailContextSelector = 'body'

  if (host === 'mail.google.com') {
    try {
      // 邮件列表容器
      const rootElement = document.querySelector(
        'div[role="list"]',
      ) as HTMLDivElement
      // 点击展开
      if (rootElement) {
        const myEmailAddress =
          document
            .querySelector('header a[aria-label][role="button"]:has(> img)')
            ?.getAttribute('aria-label')
            ?.match(emailRegex)?.[0] || ''
        const emailCorrespondence = new EmailCorrespondence(myEmailAddress)
        const expandEmailButton = rootElement.querySelector<HTMLButtonElement>(
          'span[role="button"][aria-expanded][aria-label][tabindex]',
        )
        if (expandEmailButton) {
          expandEmailButton.click()
          await delayAndScrollToInputAssistantButton(
            3000,
            inputAssistantButtonElement,
          )
        }
        const subject =
          document.querySelector('h2[data-thread-perm-id]')?.textContent ||
          document.title

        let temporarySpecialStyle: HTMLStyleElement | null = null

        const emailList = Array.from(
          rootElement.querySelectorAll<HTMLElement>(
            'div[role="listitem"] > div > div > div > [id]',
          ),
        )
        for (let i = 0; i < emailList.length; i++) {
          const emailItemBox = emailList[i]
          const isCurrentEmail = emailItemBox.contains(
            inputAssistantButtonElement,
          )

          const emailFullContentBoxExists = Boolean(
            emailItemBox.querySelector<HTMLElement>('div[data-message-id]') ||
              emailItemBox.querySelector<HTMLElement>(
                'div[data-legacy-message-id]',
              ),
          )

          let retrievedSuccess = false

          const retrieveEmailDataThenAdd = () => {
            const emailFullContentBox =
              emailItemBox.querySelector<HTMLElement>('div[data-message-id]') ||
              emailItemBox.querySelector<HTMLElement>(
                'div[data-legacy-message-id]',
              )
            if (emailFullContentBox) {
              const gmailUsers =
                emailFullContentBox.querySelectorAll<HTMLElement>(
                  'table span[email]',
                )
              if (gmailUsers.length > 0 && !retrievedSuccess) {
                const [sender, ...receivers] = getGmailUsers(gmailUsers)

                emailCorrespondence.addEmail({
                  from: sender,
                  to: receivers,
                  subject,
                  date:
                    emailItemBox.querySelector('span[tabindex="-1"][alt]')
                      ?.textContent || '',
                  content: removeEmailContentQuote(
                    emailFullContentBox.querySelector<HTMLElement>(
                      'div[id][jslog] > div[id]',
                    ),
                  ),
                })
                retrievedSuccess = true
              }
            }
            return retrievedSuccess
          }

          if (emailFullContentBoxExists) {
            retrieveEmailDataThenAdd()
          } else {
            // 为了获取到邮件内容，需要展开邮件，需要添加样式让用户感知不到展开的过程
            if (!temporarySpecialStyle) {
              temporarySpecialStyle = document.createElement('style')
              temporarySpecialStyle.innerHTML = `div[role="listitem"]>div>div>div>[id]>div:nth-child(1){display:flex!important;} div[role="listitem"]>div>div>div>[id]>div:nth-child(2){display:none!important;}`
              document
                .getElementsByTagName('head')[0]
                .appendChild(temporarySpecialStyle)
            }
            await new Promise<void>((resolve) => {
              let tryLimit = 0
              // 用 MutationObserver 来检测邮件内容是否加载完成
              const observer = new MutationObserver(() => {
                tryLimit++
                if (retrieveEmailDataThenAdd() || tryLimit === 30) {
                  observer.disconnect()
                  resolve()
                }
              })
              observer.observe(emailItemBox, {
                childList: true,
                subtree: true,
              })
              emailItemBox
                .querySelector<HTMLElement>('& > div:nth-child(1)')
                ?.click()
              // in case the dom is not updated
              setTimeout(() => {
                if (!retrievedSuccess) {
                  retrieveEmailDataThenAdd() // try the last time
                  observer.disconnect()
                  resolve()
                }
              }, 2000)
            })
          }

          if (!emailFullContentBoxExists) {
            emailItemBox
              .querySelector<HTMLElement>(
                '& > div:nth-child(2) [data-message-id] > div:nth-child(2) > div > table',
              )
              ?.click()
          }

          //如果发现了inputAssistantButtonElement, 说明是在这个邮件上操作的, 就不用再找了
          if (isCurrentEmail) {
            break
          }
        }

        if (temporarySpecialStyle) {
          // eslint-disable-next-line no-extra-semi
          ;(temporarySpecialStyle as HTMLStyleElement)?.remove()
        }

        if (emailCorrespondence.emails.length > 0) {
          emailCorrespondence.sortEmails()
          instantReplyDataHelper.setAttribute(
            'data-full-context-cache',
            emailCorrespondence.emailContext.emailContext,
          )
          instantReplyDataHelper.setAttribute(
            'data-target-context-cache',
            emailCorrespondence.emailContext.targetReplyEmailContext,
          )
          return emailCorrespondence.emailContext
        }
      }
    } catch (err) {
      // 如果 Gmail 新版逻辑报错了，走旧版的逻辑
      console.error(err)

      // 邮件列表容器
      const rootElement = document.querySelector(
        'div[role="list"]',
      ) as HTMLDivElement
      // 点击展开
      if (rootElement) {
        const emailCorrespondence = new DeprecatedEmailCorrespondence()
        const expandEmailButton = rootElement.querySelector(
          'span[role="button"][aria-expanded][tabindex="-1"]',
        ) as HTMLButtonElement
        if (expandEmailButton) {
          expandEmailButton.click()
          await wait(3000)
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
          if (
            messageItems[i].querySelectorAll('table span[email]').length >= 2
          ) {
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
                    item?.getAttribute('aria-label')?.match(emailRegex)?.[0] ||
                    ''
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
            messageItem.querySelector('span[tabindex="-1"][alt]')
              ?.textContent || ''
          const currentMessageEmail =
            messageItem
              .querySelector('h3 span[email]')
              ?.getAttribute('email') ||
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
        instantReplyDataHelper.setAttribute(
          'data-full-context-cache',
          emailCorrespondence.emailContext.emailContext,
        )
        instantReplyDataHelper.setAttribute(
          'data-target-context-cache',
          emailCorrespondence.emailContext.targetReplyEmailContext,
        )
        return emailCorrespondence.emailContext
      }
    }

    // if doesnt have emails, it means it is performing `Summary` action
    emailContextSelector = 'div[role="list"]'
  } else if (host === 'outlook.live.com') {
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

      const expandMoreButton = document.querySelector<HTMLButtonElement>(
        'div[tabindex] > div[role="button"][aria-label]',
      )
      expandMoreButton?.click()
      // ======================== 1.列表框展开回复 ========================
      // 邮件列表容器
      const rootElement =
        document.querySelector<HTMLDivElement>(
          'div[data-app-section="ConversationContainer"]',
        ) ||
        document.querySelector<HTMLDivElement>(
          'div[data-app-section="MailReadCompose"] div[data-app-section="ItemContainer"]',
        )
      const detailEmailContextElement = document.querySelector<HTMLElement>(
        '#ReadingPaneContainerId div[id] > div[role="textbox"]',
      )

      if (rootElement && rootElement.contains(inputAssistantButtonElement)) {
        const messageItems: Element[] = []
        const totalMessageItems = Array.from(
          rootElement.querySelectorAll('& > div > div:has(div[tabindex])'),
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

        if (!document.querySelector('#mectrl_currentAccount_primary')) {
          const temporarySpecialStyle = document.createElement('style')
          temporarySpecialStyle.innerHTML = `#mectrl_main_body{display:none!important;}`
          document
            .getElementsByTagName('head')[0]
            .appendChild(temporarySpecialStyle)
          const profileButton = document.querySelector(
            '#meInitialsButton',
          ) as HTMLButtonElement
          while (!document.querySelector('#mectrl_currentAccount_primary')) {
            profileButton.click()
            await wait(2000)
          }
          temporarySpecialStyle.remove()
        }
        const myEmailAddress =
          document.querySelector<HTMLElement>(
            '#mectrl_currentAccount_secondary',
          )?.textContent || ''

        const emailCorrespondence = new EmailCorrespondence(myEmailAddress)

        // 寻找sender和receiver
        for (let i = 0; i < messageItems.length; i++) {
          const messageItem = messageItems[i]
          let emailElementsSelector =
            '& > div:nth-child(1) span[data-lpc-hover-target-id]:not([class*="undefined"])'
          if (expandMoreButton && messageItem.contains(expandMoreButton)) {
            emailElementsSelector =
              'span[data-lpc-hover-target-id]:not([class*="undefined"])'
          }
          const emailEmailElements = Array.from(
            messageItem.querySelectorAll<HTMLElement>(emailElementsSelector),
          )
          const receiverElement = messageItem.querySelector(
            'div[data-testid="RecipientWell"]',
          )
          if (!receiverElement || emailEmailElements.length === 0) {
            continue
          }
          const date =
            messageItem.querySelector<HTMLElement>(
              'div[data-testid="SentReceivedSavedTime"]',
            )?.innerText || ''
          const content = removeEmailContentQuote(
            messageItem.querySelector<HTMLElement>('#UniqueMessageBody') ||
              messageItem.querySelector<HTMLElement>('div[role="document"]'),
          )
          const emailData: IEmailData = {
            from: {
              email: '',
              name: '',
            },
            to: [],
            date,
            subject,
            content,
          }
          // 因为outlook的html中，用户本身 和 第一封邮件是不带邮件地址的，所以只能先判断有没有邮件，再判断是不是接受者
          emailEmailElements.forEach((emailElement) => {
            const emailElementContext = emailElement.textContent || ''
            const emailAddress =
              emailElementContext.match(emailRegex)?.[0] ||
              emailElement
                ?.getAttribute('aria-label')
                ?.match(emailRegex)?.[0] ||
              ''

            const name = emailElementContext
              .replace(` <${emailAddress}>`, '')
              .replace(`;`, '')
            if (receiverElement?.contains(emailElement)) {
              emailData.to.push({
                email: emailAddress,
                name,
              })
            } else {
              emailData.from.email = emailAddress
              emailData.from.name = name
            }
          })
          emailCorrespondence.addEmail(emailData)
        }
        emailCorrespondence.sortEmails()
        emailCorrespondence.emails.forEach(({ from, to }, index) => {
          if (from.email === '') {
            let emailAddress = myEmailAddress
            if (index === 0) {
              const highlightEmail = document.querySelector<HTMLElement>(
                '[role="listbox"] .epBmH span[title*="@"]',
              )
              if (highlightEmail?.textContent === from.name) {
                emailAddress =
                  highlightEmail
                    .getAttribute('title')
                    ?.match(emailRegex)?.[0] || ''
              }
            }
            from.email = emailAddress
          }
          to.forEach((receiver) => {
            if (receiver.email === '') {
              receiver.email = myEmailAddress
            }
          })
        })

        if (emailCorrespondence.emails.length > 0) {
          instantReplyDataHelper.setAttribute(
            'data-full-context-cache',
            emailCorrespondence.emailContext.emailContext,
          )
          instantReplyDataHelper.setAttribute(
            'data-target-context-cache',
            emailCorrespondence.emailContext.targetReplyEmailContext,
          )
          return emailCorrespondence.emailContext
        }

        // if doesnt have emails, it means it is performing `Summary` action
        emailContextSelector = 'div[data-app-section="ConversationContainer"]'
      }

      // ======================== 2.弹窗邮件详情页回复 ========================
      const modalEmailContextElement =
        (document.querySelector(
          'div[role="dialog"] div[role="textbox"][textprediction]',
        ) as HTMLDivElement) ||
        (document.querySelector(
          'div[role="dialog"] div[id] > div[role="textbox"]',
        ) as HTMLDivElement)
      const modalElement = (
        Array.from(
          document.querySelectorAll('div[role="dialog"]'),
        ) as HTMLDivElement[]
      ).find((modalElement) => modalElement.contains(modalEmailContextElement))
      if (modalElement && modalElement.contains(inputAssistantButtonElement)) {
        const emailContext = outlookGetSingleEmailText(modalEmailContextElement)
        if (emailContext) {
          instantReplyDataHelper.setAttribute(
            'data-full-context-cache',
            emailContext.emailContext,
          )
          instantReplyDataHelper.setAttribute(
            'data-target-context-cache',
            emailContext.targetReplyEmailContext,
          )
          return emailContext
        }
        emailContextSelector = '#ReadingPaneContainerId'
      }

      // ======================== 3.邮件详情页回复 ========================
      const detailEmailRootElement = document.querySelector(
        '#ReadingPaneContainerId',
      ) as HTMLDivElement
      if (detailEmailRootElement?.contains(inputAssistantButtonElement)) {
        const emailContext = outlookGetSingleEmailText(
          detailEmailContextElement,
        )
        if (emailContext) {
          instantReplyDataHelper.setAttribute(
            'data-full-context-cache',
            emailContext.emailContext,
          )
          instantReplyDataHelper.setAttribute(
            'data-target-context-cache',
            emailContext.targetReplyEmailContext,
          )
          return emailContext
        }
        emailContextSelector = '#ReadingPaneContainerId'
      }
    } catch (e) {
      emailContextSelector = 'div[data-app-section="ConversationContainer"]'
    }

    // 如果 Outlook 新版逻辑报错了，走旧版的逻辑
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
        const emailCorrespondence = new DeprecatedEmailCorrespondence()
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
          await wait(2000)
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
          instantReplyDataHelper.setAttribute(
            'data-full-context-cache',
            emailCorrespondence.emailContext.emailContext,
          )
          instantReplyDataHelper.setAttribute(
            'data-target-context-cache',
            emailCorrespondence.emailContext.targetReplyEmailContext,
          )
          return emailCorrespondence.emailContext
        }
        emailContextSelector = 'div[data-app-section="ConversationContainer"]'
      }
    } catch (err) {
      console.error(err)
      emailContextSelector = 'div[data-app-section="ConversationContainer"]'
    }
  } else if (
    host === 'outlook.office.com' ||
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
        const emailCorrespondence = new DeprecatedEmailCorrespondence()
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
          await wait(2000)
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
          instantReplyDataHelper.setAttribute(
            'data-full-context-cache',
            emailCorrespondence.emailContext.emailContext,
          )
          instantReplyDataHelper.setAttribute(
            'data-target-context-cache',
            emailCorrespondence.emailContext.targetReplyEmailContext,
          )
          return emailCorrespondence.emailContext
        }
        emailContextSelector = 'div[data-app-section="ConversationContainer"]'
      }
      // ======================== 2.弹窗邮件详情页回复 ========================
      const modalEmailContextElement =
        (document.querySelector(
          'div[role="dialog"] div[role="textbox"][textprediction]',
        ) as HTMLDivElement) ||
        (document.querySelector(
          'div[role="dialog"] div[id] > div[role="textbox"]',
        ) as HTMLDivElement)
      const modalElement = (
        Array.from(
          document.querySelectorAll('div[role="dialog"]'),
        ) as HTMLDivElement[]
      ).find((modalElement) => modalElement.contains(modalEmailContextElement))
      if (modalElement && modalElement.contains(inputAssistantButtonElement)) {
        const emailContext = outlookGetSingleEmailText(modalEmailContextElement)
        if (emailContext) {
          instantReplyDataHelper.setAttribute(
            'data-full-context-cache',
            emailContext.emailContext,
          )
          instantReplyDataHelper.setAttribute(
            'data-target-context-cache',
            emailContext.targetReplyEmailContext,
          )
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
        const emailContext = outlookGetSingleEmailText(
          detailEmailContextElement,
        )
        if (emailContext) {
          instantReplyDataHelper.setAttribute(
            'data-full-context-cache',
            emailContext.emailContext,
          )
          instantReplyDataHelper.setAttribute(
            'data-target-context-cache',
            emailContext.targetReplyEmailContext,
          )
          return emailContext
        }
        emailContextSelector = '#ReadingPaneContainerId'
      }
    } catch (e) {
      emailContextSelector = 'div[data-app-section="ConversationContainer"]'
    }
  } else if (host === 'mail.yahoo.com') {
    emailContextSelector = 'div[data-test-id="message-group-view-scroller"]'
  } else if (host === 'wx.mail.qq.com') {
    emailContextSelector = 'div.container'
  } else if (host === 'mail.proton.me') {
    document
      .querySelectorAll('div.scroll-inner .message-header')
      .forEach((item) => {
        hasMore = true
        ;(item as HTMLElement).click()
      })
    iframeSelector = 'iframe[sandbox]'
    emailContextSelector = 'div#proton-root'
  } else if (host === 'mail.zoho.com') {
    document
      .querySelectorAll('div.zmPVContent .zmTMailList .zmMHdrSumContent')
      .forEach((emailItem) => {
        hasMore = true
        ;(emailItem as HTMLElement).click()
      })
    emailContextSelector = 'div.zmPVContent'
  }

  if (hasMore) {
    await wait(3000)
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
    return {
      targetReplyEmailContext: pageContent,
      emailContext: pageContent,
    }
  } catch (e) {
    const pageContent = await getPageContentWithMozillaReadability()
    return {
      targetReplyEmailContext: pageContent,
      emailContext: pageContent,
    }
  }
}
