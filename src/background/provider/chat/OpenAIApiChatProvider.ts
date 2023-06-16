import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { OpenAiApiChat } from '@/background/src/chat'
import { setChromeExtensionSettings } from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { v4 as uuidV4 } from 'uuid'

class OpenAIApiChatProvider implements ChatAdapterInterface {
  private openAiApiChat: OpenAiApiChat

  constructor(openAiApiChat: OpenAiApiChat) {
    this.openAiApiChat = openAiApiChat
  }
  async auth(authTabId: number) {
    await this.openAiApiChat.auth()
  }
  async preAuth() {
    await this.openAiApiChat.preAuth()
  }
  get status() {
    // NOTE: This is a hack to make sure the status is updated
    this.openAiApiChat.checkApiKey()
    return this.openAiApiChat.status
  }
  async createConversation() {
    return Promise.resolve('')
  }
  async removeConversation(conversationId: string) {
    await setChromeExtensionSettings({
      conversationId: '',
    })
    await this.openAiApiChat.resetMessagesContext()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    await this.openAiApiChat.askChatGPT(
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
              messageId: uuidV4(),
            },
            error,
            done,
          })
        }
      },
    )
  }
  async abortAskQuestion(messageId: string) {
    return await this.openAiApiChat.abortTask(messageId)
  }
  async destroy() {
    await this.openAiApiChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
}
export { OpenAIApiChatProvider }
