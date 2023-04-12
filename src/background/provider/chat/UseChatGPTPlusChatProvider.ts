import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { UseChatGPTPlusChat } from '@/background/src/ChatGPT'
import { setChromeExtensionSettings } from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { v4 as uuidV4 } from 'uuid'

class UseChatGPTPlusChatProvider implements ChatAdapterInterface {
  private useChatGPTPlusChat: UseChatGPTPlusChat

  constructor(useChatGPTPlusChat: UseChatGPTPlusChat) {
    this.useChatGPTPlusChat = useChatGPTPlusChat
  }
  async auth(authTabId: number) {
    await this.useChatGPTPlusChat.auth(authTabId)
  }
  get status() {
    return this.useChatGPTPlusChat.status
  }
  async createConversation() {
    return Promise.resolve('')
  }
  async removeConversation(conversationId: string) {
    await setChromeExtensionSettings({
      conversationId: '',
    })
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    await this.useChatGPTPlusChat.askChatGPT(
      question.question,
      {
        taskId: question.messageId,
        include_history: options.includeHistory,
      },
      async ({ type, data }) => {
        console.log('response', type, data)
        if (sender.tab?.id) {
          await this.sendResponseToClient(sender.tab.id, {
            taskId,
            data: {
              text: data.text,
              conversationId: data.conversationId,
              messageId: uuidV4(),
              parentMessageId: question.messageId,
            },
            error: data.error,
            done: type === 'done',
          })
          // 这么写是因为适配客户端
          if (type !== 'done') {
            await this.sendResponseToClient(sender.tab.id, {
              taskId,
              data: {},
              error: '',
              done: true,
            })
          }
        }
      },
    )
  }
  async abortAskQuestion(messageId: string) {
    return await this.useChatGPTPlusChat.abortTask(messageId)
  }
  async destroy() {
    await this.useChatGPTPlusChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
}
export { UseChatGPTPlusChatProvider }
