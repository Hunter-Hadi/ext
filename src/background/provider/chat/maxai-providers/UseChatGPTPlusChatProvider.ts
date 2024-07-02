import { v4 as uuidV4 } from 'uuid'
import Browser from 'webextension-polyfill'

import { backgroundRequestHeadersGenerator } from '@/background/api/backgroundRequestHeadersGenerator'
import {
  ChatAdapterInterface,
  IChatGPTAskQuestionFunctionType,
} from '@/background/provider/chat/ChatAdapter'
import { maxAIAPISendQuestion } from '@/background/provider/chat/maxai-providers/index'
import { UseChatGPTPlusChat } from '@/background/src/chat'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import {
  APP_USE_CHAT_GPT_API_HOST,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
  SUMMARY__CITATION__PROMPT_ID,
} from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'
import {
  IAIResponseSourceCitation,
  IChatUploadFile,
} from '@/features/indexed_db/conversations/models/Message'

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
  async createConversation(initConversationData: Partial<IConversation>) {
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
    await maxAIAPISendQuestion(taskId, sender, question, {
      conversationId:
        question.conversationId ||
        this.useChatGPTPlusChat.conversation?.id ||
        '',
      AIProvider: 'USE_CHAT_GPT_PLUS',
      AIModel:
        this.useChatGPTPlusChat.conversation?.meta.AIModel ||
        USE_CHAT_GPT_PLUS_MODELS[0].value,
      checkAuthStatus: async () => {
        // await this.auth(sender.tab?.id || 0)
        await this.useChatGPTPlusChat.checkTokenAndUpdateStatus()
        return this.status === 'success'
      },
      beforeSend: async () => {
        this.clearFiles()
      },
      setAbortController: (abortController) => {
        this.useChatGPTPlusChat.taskList[taskId] = () => abortController.abort()
      },
      afterSend: async (reason) => {
        if (reason === 'token_expired') {
          this.useChatGPTPlusChat.status = 'needAuth'
          await this.useChatGPTPlusChat.updateClientConversationChatStatus()
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
  async tempGetCitation(
    taskId: string,
    question: string,
    AIResponse: string,
    systemPrompt: string,
  ): Promise<IAIResponseSourceCitation[] | undefined> {
    try {
      const headers = backgroundRequestHeadersGenerator.getTaskIdHeaders(
        taskId,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getMaxAIChromeExtensionAccessToken()}`,
        },
      )
      const result = await fetch(
        `${APP_USE_CHAT_GPT_API_HOST}/gpt/chat_small_document_citation`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            chat_history: [
              {
                role: 'system',
                content: [
                  {
                    type: 'text',
                    text: systemPrompt,
                  },
                ],
              },
              {
                role: 'ai',
                content: [
                  {
                    type: 'text',
                    text: AIResponse,
                  },
                ],
              },
            ],
            streaming: false,
            temperature: 0.2,
            message_content: [
              {
                type: 'text',
                text: question,
              },
            ],
            prompt_name: 'summary_citation',
            prompt_id: SUMMARY__CITATION__PROMPT_ID,
            prompt_action_type: 'chat_complete',
            prompt_type: 'preset',
          }),
        },
      )
      const data: {
        status: string
        sources: Array<{
          content: string
          snippet: string
        }>
      } = await result.json()
      if (data.status === 'OK') {
        return data.sources
      }
      return []
    } catch (e) {
      return undefined
    }
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
