import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { UseChatGPTPlusChat } from '@/background/src/chat'
import {
  IMaxAIChatGPTBackendAPIType,
  IMaxAIRequestHistoryMessage,
} from '@/background/src/chat/UseChatGPTChat/types'
import { chatMessageToMaxAIRequestMessage } from '@/background/src/chat/util'
import ConversationManager, {
  IChatConversation,
} from '@/background/src/chatConversations'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { isAIMessage } from '@/features/chatgpt/utils/chatMessageUtils'

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
  ) => {
    const messageId = uuidV4()
    const chat_history: IMaxAIRequestHistoryMessage[] = []
    const conversationDetail =
      await ConversationManager.conversationDB.getConversationById(
        question.conversationId,
      )
    let backendAPI: IMaxAIChatGPTBackendAPIType = 'get_chatgpt_response'
    const docId = conversationDetail?.meta?.docId
    if (conversationDetail) {
      // 查看最后一条消息是不是待完成的aiMessage
      let isUnFinishAIMessage = false // 其实这里的意思是summary的message有没有完成
      const lastMessage =
        conversationDetail.messages.length &&
        conversationDetail.messages[conversationDetail.messages.length - 1]
      if (lastMessage && isAIMessage(lastMessage)) {
        // 有originalMessage说明是增强型的AI message
        if (
          lastMessage.originalMessage &&
          !lastMessage.originalMessage?.metadata?.isComplete
        ) {
          isUnFinishAIMessage = true
        }
      }
      // 大文件聊天之前上传的上下文的documentId
      if (docId && !isUnFinishAIMessage) {
        backendAPI = 'chat_with_document'
      } else if (conversationDetail?.type === 'Summary') {
        backendAPI = 'get_summarize_response'
      }
      // 没有docId或者isUnFinishAIMessage的情况下，需要发送系统提示
      if (
        (!docId || isUnFinishAIMessage) &&
        conversationDetail.meta.systemPrompt
      ) {
        chat_history.push({
          role: 'system',
          content: [
            {
              type: 'text',
              text: conversationDetail.meta.systemPrompt,
            },
          ],
        })
      }
      question.meta?.historyMessages?.forEach((message) => {
        chat_history.push(chatMessageToMaxAIRequestMessage(message, true))
      })
      if (docId && chat_history?.[0]?.role === 'ai') {
        // summary里面的chat history不包括页面的自动summary对话
        // 这个自动总结的对话会影响后续用户真正问的问题，我们在chat_with_document传chat hisotry的时候把这两条去掉吧
        // 2023-09-21 @xiang.xu
        chat_history.splice(0, 1)
      }
    }
    const questionMessage = chatMessageToMaxAIRequestMessage(question)
    await this.useChatGPTPlusChat.askChatGPT(
      questionMessage.content,
      {
        doc_id: docId,
        backendAPI,
        taskId: question.messageId,
        chat_history,
        meta: question.meta,
      },
      async ({ type, done, error, data }) => {
        if (sender.tab?.id) {
          await this.sendResponseToClient(sender.tab.id, {
            taskId,
            data: {
              text: data.text,
              parentMessageId: question.messageId,
              conversationId: data.conversationId,
              sourceCitations: data.sourceCitations,
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
    return await this.useChatGPTPlusChat.abortTask(messageId)
  }
  async destroy() {
    await this.useChatGPTPlusChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
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
