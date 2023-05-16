import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { PoeChat } from '@/background/src/chat'
import { setChromeExtensionSettings } from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/types'
import { v4 as uuidV4 } from 'uuid'

class PoeChatProvider implements ChatAdapterInterface {
  private poeChat: PoeChat

  constructor(poeChat: PoeChat) {
    this.poeChat = poeChat
  }
  async auth(authTabId: number) {
    await this.poeChat.auth()
  }
  async preAuth() {
    // 进入聊天界面再进行认证
    await this.poeChat.auth()
  }
  get status() {
    return this.poeChat.status
  }
  async createConversation() {
    return Promise.resolve('')
  }
  async removeConversation(conversationId: string) {
    await setChromeExtensionSettings({
      conversationId: '',
    })
    this.poeChat.resetConversation()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    await this.poeChat.askChatGPT(
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
    return await this.poeChat.abortTask(messageId)
  }
  async destroy() {
    await this.poeChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
}
export { PoeChatProvider }
