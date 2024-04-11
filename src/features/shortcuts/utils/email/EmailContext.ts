export default class EmailCorrespondence {
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
