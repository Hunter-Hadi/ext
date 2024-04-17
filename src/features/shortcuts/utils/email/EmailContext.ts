export type IEmailUserData = {
  email: string
  name: string
}

export interface IEmailData {
  from: IEmailUserData
  to: IEmailUserData[]
  subject: string
  date: string
  content: string
}
export interface ICreateEmailListData {
  text: string
  data: IEmailData
}

const createEmailListData = (emails: IEmailData[]): ICreateEmailListData[] => {
  const emailListData: ICreateEmailListData[] = []
  for (let index = 0; index < emails.length; index++) {
    const email = emails[index]
    const { from: sender, to: receivers, subject, date, content } = email
    emailListData.push({
      text: `## Email #${index + 1}
**From:** ${sender.name}<${sender.email}>
**To:** ${receivers
        .map((receiver) => `${receiver.name}<${receiver.email}>`)
        .join(', ')}
**Date:** ${date}
**Subject:** ${subject}

${content}

---
`,
      data: email,
    })
  }
  return emailListData
}

export default class EmailCorrespondence {
  emailAddress: string
  emails: IEmailData[] = []
  constructor(emailAddress: string) {
    this.emailAddress = emailAddress
  }
  addEmail(email: IEmailData) {
    this.emails.push(email)
  }
  sortEmails() {
    this.emails.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }
  get emailContext() {
    const emailListData = createEmailListData(this.emails)
    let targetReplyEmailContext = ''
    const emailContext = emailListData
      .map(({ data, text }) => {
        if (data.from.email !== this.emailAddress) {
          targetReplyEmailContext = text
        }
        return text
      })
      .join('\n')
    if (!targetReplyEmailContext) {
      targetReplyEmailContext = emailListData.at(-1)?.text || ''
    }

    return {
      targetReplyEmailContext,
      emailContext,
    }
  }
}
