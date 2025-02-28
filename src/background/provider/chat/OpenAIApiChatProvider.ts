import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { OpenAIApiChat } from '@/background/src/chat'
import {
  IOpenAIApiChatMessage,
  openAIAPISystemPromptGenerator,
} from '@/background/src/chat/OpenAIApiChat/types'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'

class OpenAIApiChatProvider implements ChatAdapterInterface {
  private openAiApiChat: OpenAIApiChat

  constructor(openAiApiChat: OpenAIApiChat) {
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
  get conversation() {
    return this.openAiApiChat.conversation
  }
  async createConversation(initConversationData: Partial<IConversation>) {
    if (
      initConversationData?.id &&
      this.openAiApiChat.conversation?.id &&
      initConversationData.id !== this.openAiApiChat.conversation.id
    ) {
      console.log('新版Conversation 因为conversation id变了, 移除conversation')
      await this.openAiApiChat.resetMessagesContext()
    }
    return await this.openAiApiChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    await this.openAiApiChat.removeConversationWithCache()
    await this.openAiApiChat.resetMessagesContext()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    const messageId = uuidV4()
    const history: IOpenAIApiChatMessage[] = [
      {
        role: 'system',
        content:
          this.openAiApiChat.conversation?.meta.systemPrompt ||
          openAIAPISystemPromptGenerator(
            this.openAiApiChat.conversation?.meta.AIModel || '',
          ),
      },
    ]
    const options = question.meta || {}
    options.historyMessages?.forEach((message) => {
      history.push({
        role: message.type === 'ai' ? 'assistant' : 'user',
        content: message.text,
      })
    })
    // 要删掉头部2个history，因为没计算system prompt和question
    await this.openAiApiChat.askChatGPT(
      question.text,
      {
        taskId: question.messageId,
        regenerate: options.regenerate,
        include_history: options.includeHistory,
        max_history_message_cnt: options.maxHistoryMessageCnt,
        history,
        meta: options,
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
    return await this.openAiApiChat.abortTask(messageId)
  }
  async destroy() {
    await this.openAiApiChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.openAiApiChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.openAiApiChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.openAiApiChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.openAiApiChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.openAiApiChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.openAiApiChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.openAiApiChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.openAiApiChat.clearFiles()
  }
}
export { OpenAIApiChatProvider }
