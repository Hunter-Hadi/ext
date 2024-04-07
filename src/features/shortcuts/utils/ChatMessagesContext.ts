export interface IChatMessageData {
  content: string
  user: string
  datetime: string
  extraLabel?: string
}

export interface IChatMessagesContextData {
  serverName: string
  chatroomName: string
  username: string
  replyMessage?: IChatMessageData
  chatMessages: IChatMessageData[]
  // 要回复的对象信息
  MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT: string
  // 用到的 chat messages 上下文
  MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT: string
}

export interface ICreateChatMessageListData {
  text: string
  data: IChatMessageData
}

export const createChatMessageListData = (
  chatMessages: IChatMessageData[],
): ICreateChatMessageListData[] => {
  const chatMessageListData: ICreateChatMessageListData[] = []
  for (let index = 0; index < chatMessages.length; index++) {
    const message = chatMessages[index]
    const { user, datetime, content, extraLabel } = message
    let messageText = `[Chat Message ${index + 1}]
**User:** ${user}
**DateTime:** ${datetime}`
    if (extraLabel) {
      messageText += `\n**Extra Label:**\n${extraLabel}`
    }
    messageText += `\n**Content:**\n${content}`
    chatMessageListData.push({
      text: messageText,
      data: message,
    })
  }
  return chatMessageListData
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
      MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT: '',
      MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT: '',
    }
  }
  replyMessage(messageIndex: number) {
    // this.replyMessageIndex = this.chatMessages.findIndex(
    //   ({ date, content }) =>
    //     message.date === date && message.content === content,
    // )
    this.replyMessageIndex = messageIndex
  }
  get data(): IChatMessagesContextData {
    const { serverName, chatroomName, username } = this.config
    let replyMessageIndex =
      this.chatMessages.length >= 30 ? 30 : this.chatMessages.length
    const chatMessages = this.chatMessages.slice(-30)

    replyMessageIndex =
      this.replyMessageIndex - this.chatMessages.length + replyMessageIndex
    const replyMessage = chatMessages.at(replyMessageIndex)

    const chatMessageListData = createChatMessageListData(chatMessages)

    const MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT = `[Chat Server Info]
**Server Name:** ${serverName || 'N/A'}
**Chatroom Name:** ${chatroomName || 'N/A'}
**My Username:** ${username || 'N/A'}

==================
${chatMessageListData.map((message) => message.text).join('\n\n')}
`

    return {
      ...this.config,
      replyMessage,
      chatMessages,
      MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT:
        chatMessageListData.at(replyMessageIndex)?.text ?? '',
      MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT,
    }
  }
}
