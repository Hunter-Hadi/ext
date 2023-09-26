import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { OpenAIChat } from '../chat/OpenAiChat'

class OpenAIChatProvider implements ChatAdapterInterface {
  private openAIChat: OpenAIChat
  constructor(openAIChat: OpenAIChat) {
    this.openAIChat = openAIChat
  }
  async preAuth() {
    return this.openAIChat.preAuth()
  }
  async auth(authTabId: number) {
    await this.openAIChat.auth(authTabId)
  }
  get status() {
    return this.openAIChat.status
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    const messageId = uuidV4()

    // await this.openAIChat.createConversation()

    await this.openAIChat.askChatGPT(
      question.question,
      {
        taskId: question.messageId,
        regenerate: options.regenerate,
        include_history: options.includeHistory,
        max_history_message_cnt: options.maxHistoryMessageCnt,
      },
      async ({ type, done, error, data }) => {
        if (sender.tab?.id) {
          await this.sendResponseToClient(sender.tab.id, {
            taskId,
            data: {
              text: data.text,
              parentMessageId: question.messageId,
              conversationId: data.conversationId,
              messageId,
            },
            error,
            done,
          })
        }
      },
    )
  }
  async abortAskQuestion(messageId: string) {
    try {
      await this.openAIChat.abortAskQuestion(messageId)
      return true
    } catch (error) {
      return false
    }
  }

  async createConversation() {
    // return await this.openAIChat.createConversation()
    return Promise.resolve('')
  }
  async removeConversation(conversationId: string) {
    return await this.openAIChat.removeConversation(conversationId)
  }
  destroy() {
    return this.openAIChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
}
export { OpenAIChatProvider }
