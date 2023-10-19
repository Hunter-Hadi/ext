import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { UseChatGPTPlusChat } from '@/background/src/chat'
import Browser from 'webextension-polyfill'
import { CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { v4 as uuidV4 } from 'uuid'
import { IChatUploadFile } from '@/features/chatgpt/types'
import ConversationManager, {
  IChatConversation,
} from '@/background/src/chatConversations'
import { IMaxAIChatGPTMessageType } from '@/background/src/chat/UseChatGPTChat/types'

class UseChatGPTPlusChatProvider implements ChatAdapterInterface {
  private useChatGPTPlusChat: UseChatGPTPlusChat

  constructor(useChatGPTPlusChat: UseChatGPTPlusChat) {
    this.useChatGPTPlusChat = useChatGPTPlusChat
  }
  async auth(authTabId: number) {
    await this.useChatGPTPlusChat.auth(authTabId)
  }
  async preAuth() {
    await this.useChatGPTPlusChat.preAuth()
  }
  get status() {
    return this.useChatGPTPlusChat.status
  }
  get conversation() {
    return this.useChatGPTPlusChat.conversation
  }
  async createConversation(initConversationData: Partial<IChatConversation>) {
    return await this.useChatGPTPlusChat.createConversation(
      initConversationData,
    )
  }
  async removeConversation(conversationId: string) {
    await this.useChatGPTPlusChat.removeConversationWithCache()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
    options,
  ) => {
    const messageId = uuidV4()
    const chat_history: IMaxAIChatGPTMessageType[] = []
    const conversationDetail = await ConversationManager.conversationDB.getConversationById(
      question.conversationId,
    )
    // 大文件聊天之前上传的上下文的documentId
    const docId = conversationDetail?.meta?.docId
    if (this.useChatGPTPlusChat.conversation) {
      // 有docId的情况下，不需要发送系统提示
      if (!docId && this.useChatGPTPlusChat.conversation.meta.systemPrompt) {
        chat_history.push({
          type: 'system',
          data: {
            content: this.useChatGPTPlusChat.conversation.meta.systemPrompt,
            additional_kwargs: {},
          },
        })
      }
      options.historyMessages?.forEach((message) => {
        chat_history.push({
          type: message.type === 'ai' ? 'ai' : 'human',
          data: {
            content: message.text,
            additional_kwargs: {},
          },
        })
      })
    }
    if (docId && chat_history?.[0]?.type === 'human') {
      // summary里面的chat history不包括页面的自动summary对话
      // 这个自动总结的对话会影响后续用户真正问的问题，我们在chat_with_document传chat hisotry的时候把这两条去掉吧
      // 2023-09-21 @xiang.xu
      chat_history.splice(0, 2)
    }
    await this.useChatGPTPlusChat.askChatGPT(
      question.question,
      {
        doc_id: docId,
        backendAPI: docId ? 'chat_with_document' : 'get_chatgpt_response',
        taskId: question.messageId,
        chat_history,
        meta: options.meta,
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
              originalMessage: data.originalMessage,
            },
            error,
            done,
          })
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
  get chatFiles() {
    return this.useChatGPTPlusChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.useChatGPTPlusChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.useChatGPTPlusChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.useChatGPTPlusChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.useChatGPTPlusChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.useChatGPTPlusChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.useChatGPTPlusChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.useChatGPTPlusChat.clearFiles()
  }
}
export { UseChatGPTPlusChatProvider }
