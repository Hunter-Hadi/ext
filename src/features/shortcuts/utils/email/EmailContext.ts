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

---
`,
      data: email,
    })
  }
  return emailListData
}

export default class EmailCorrespondence {
  emails: IEmailData[] = []
  receivers: Set<string> = new Set()
  constructor() {}
  addEmail(email: IEmailData) {
    this.emails.push(email)
  }
  addReceiver(receiver: IEmailUserData) {
    this.receivers.add(receiver.email)
  }
  sortEmails() {
    this.emails.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })
  }
  get emailContext() {
    const emailListData = createEmailListData(this.emails)
    const targetReplyEmailContext = emailListData
      .filter(({ data }) => this.receivers.has(data.from.email))
      .map(({ text }) => text)
      .join('\n')
    // const emailContext = this.emails
    //   .map((email, index) => {
    //     // ## Email #1
    //     // **From:** Sender Name<sender@domain.com>
    //     // **To:** Receiver1 Name<receiver1@domain.com>, Receiver2 Name<receiver2@domain.com>
    //     // **Date:** YYYY-MM-DD
    //     // **Subject:** Email Subject
    //     //
    //     // Email content goes here.
    //     //
    //     // ---
    //     const emailContext = `## Email #${index + 1}\n**From:** ${
    //       email.from.name
    //     }<${email.from.email}>\n**To:** ${email.to
    //       .map((receiver) => `${receiver.name}<${receiver.email}>`)
    //       .join(', ')}\n**Date:** ${email.date}\n**Subject:** ${
    //       email.subject
    //     }\n\n${email.content}\n\n---\n`
    //     if (index === this.emails.length - 1) {
    //       // 这里是为了防止出现多个空行
    //       targetReplyEmailContext = emailContext.replace(/\n{2,}/g, '\n\n')
    //     }
    //     return emailContext
    //   })
    //   .join('\n')
    //   // 这里是为了防止出现多个空行
    //   .replace(/\n{2,}/g, '\n\n')
    return {
      targetReplyEmailContext,
      emailContext: emailListData.map(({ text }) => text).join('\n'),
    }
  }
}
