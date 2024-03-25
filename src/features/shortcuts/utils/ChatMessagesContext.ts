export interface IChatMessageData {
  content: string
  user: string
  date: string
  extraLabel?: string
}

export interface IChatMessagesContextData {
  serverName: string
  chatroomName: string
  username: string
  replyMessage?: IChatMessageData
  chatMessages: IChatMessageData[]
}

export default class ChatMessagesContext {
  chatMessages: IChatMessageData[] = []
  config: {
    serverName: string
    chatroomName: string
    username: string
  }
  replyMessageIndex: number = -1

  constructor(
    chatMessages: IChatMessageData[],
    config?: {
      serverName: string
      chatroomName: string
      username: string
    },
  ) {
    const { serverName = '', chatroomName = '', username = '' } = config || {}
    this.chatMessages = chatMessages
    this.config = { serverName, chatroomName, username }
    this.replyMessageIndex = -1
  }
  static get emptyData(): IChatMessagesContextData {
    return {
      serverName: '',
      chatroomName: '',
      username: '',
      chatMessages: [],
    }
  }
  replyMessage(message: IChatMessageData) {
    this.replyMessageIndex = this.chatMessages.findIndex(
      ({ date, content }) =>
        message.date === date && message.content === content,
    )
  }
  get data(): IChatMessagesContextData {
    // let replyMessage = this.chatMessages.at(-1);

    return {
      ...this.config,
      replyMessage: this.chatMessages.at(this.replyMessageIndex),
      chatMessages: this.chatMessages,
    }
  }
}
