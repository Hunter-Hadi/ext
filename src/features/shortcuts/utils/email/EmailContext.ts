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
  receivers: Set<string> = new Set()
  constructor(emailAddress: string) {
    this.emailAddress = emailAddress
  }
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
    const targetReplyEmailContext =
      emailListData
        .filter(({ data }) => this.receivers.has(data.from.email))
        .map(({ text }) => text)
        .join('\n') ||
      // // if doesnt have target, make the last email that not sent by me as target?
      // emailListData.at(
      //   emailListData.findLastIndex(
      //     ({ data }) => data.from.email !== this.emailAddress,
      //   ),
      // )?.text ||
      // // or make the last email as target?
      // emailListData.at(-1)?.text ||
      // // or just return empty string?
      ''

    return {
      targetReplyEmailContext,
      emailContext: emailListData.map(({ text }) => text).join('\n'),
    }
  }
}
