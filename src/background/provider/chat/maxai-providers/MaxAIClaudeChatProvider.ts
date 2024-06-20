import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { maxAIAPISendQuestion } from '@/background/provider/chat/maxai-providers/index'
import { MaxAIClaudeChat } from '@/background/src/chat'
import { MAXAI_CLAUDE_MODELS } from '@/background/src/chat/MaxAIClaudeChat/types'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IChatUploadFile } from '@/features/indexed_db/conversations/models/Message'

class MaxAIClaudeChatProvider implements ChatAdapterInterface {
  private maxAIClaudeChat: MaxAIClaudeChat

  constructor(maxAIClaudeChat: MaxAIClaudeChat) {
    this.maxAIClaudeChat = maxAIClaudeChat
  }
  async auth(authTabId: number) {
    await this.maxAIClaudeChat.auth(authTabId)
  }
  async preAuth() {
    await this.maxAIClaudeChat.preAuth()
  }
  get status() {
    return this.maxAIClaudeChat.status
  }
  get conversation() {
    return this.maxAIClaudeChat.conversation
  }
  async createConversation(initConversationData: Partial<IConversation>) {
    return await this.maxAIClaudeChat.createConversation(initConversationData)
  }
  async removeConversation(conversationId: string) {
    await this.maxAIClaudeChat.removeConversationWithCache()
    return Promise.resolve(true)
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = async (
    taskId,
    sender,
    question,
  ) => {
    await maxAIAPISendQuestion(taskId, sender, question, {
      conversationId:
        question.conversationId || this.maxAIClaudeChat.conversation?.id || '',
      AIProvider: 'MAXAI_CLAUDE',
      AIModel:
        this.maxAIClaudeChat.conversation?.meta.AIModel ||
        MAXAI_CLAUDE_MODELS[0].value,
      checkAuthStatus: async () => {
        await this.auth(sender.tab?.id || 0)
        return this.status === 'success'
      },
      beforeSend: async () => {
        this.clearFiles()
      },
      setAbortController: (abortController) => {
        this.maxAIClaudeChat.taskList[taskId] = () => abortController.abort()
      },
      afterSend: async (reason) => {
        if (reason === 'token_expired') {
          this.maxAIClaudeChat.status = 'needAuth'
          await this.maxAIClaudeChat.updateClientConversationChatStatus()
        }
      },
      onMessage: async ({ data, done, error, type }) => {
        if (sender.tab?.id) {
          await this.sendResponseToClient(sender.tab.id, {
            taskId,
            data: {
              text: data.text,
              parentMessageId: question.messageId,
              conversationId: data.conversationId,
              originalMessage: data.originalMessage,
              messageId: uuidV4(),
            },
            error,
            done,
          })
        }
      },
    })
  }
  async abortAskQuestion(messageId: string) {
    return await this.maxAIClaudeChat.abortTask(messageId)
  }
  async destroy() {
    await this.maxAIClaudeChat.destroy()
  }
  private async sendResponseToClient(tabId: number, data: any) {
    await Browser.tabs.sendMessage(tabId, {
      id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
      event: 'Client_askChatGPTQuestionResponse',
      data,
    })
  }
  get chatFiles() {
    return this.maxAIClaudeChat.chatFiles
  }
  async uploadFiles(files: IChatUploadFile[]) {
    return await this.maxAIClaudeChat.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    return await this.maxAIClaudeChat.updateFiles(files)
  }
  async getUploadFileToken() {
    return await this.maxAIClaudeChat.getUploadFileToken()
  }
  async removeFiles(fileIds: string[]) {
    return await this.maxAIClaudeChat.removeFiles(fileIds)
  }
  async getFiles() {
    return await this.maxAIClaudeChat.getFiles()
  }
  async abortUploadFiles(fileIds: string[]) {
    return await this.maxAIClaudeChat.abortUploadFiles(fileIds)
  }
  async clearFiles() {
    return await this.maxAIClaudeChat.clearFiles()
  }
}
export { MaxAIClaudeChatProvider }
