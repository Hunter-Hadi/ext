import { ChatAdapterInterface } from '@/background/provider/chat'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'
import { createBackgroundMessageListener } from '@/background/utils'
import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER,
  SEARCH_WITH_AI_PROVIDER_MAP,
} from '@/features/searchWithAI/constants'

import {
  getSearchWithAISettings,
  setSearchWithAISettings,
} from '../../utils/searchWithAISettings'
import { ISearchWithAISendEvent } from '../eventType'
import { initProviderChatAdapters } from '../utils'

class SearchWIthAIChatSystem {
  currentProvider?: ISearchWithAIProviderType
  currentAIModel?: string
  private adapters: {
    [key in ISearchWithAIProviderType]?: ChatAdapterInterface
  } = {}
  constructor() {
    this.adapters = initProviderChatAdapters()

    this.initChatSystem()

    // init default current provider
    getSearchWithAISettings().then((settings) => {
      this.currentProvider = settings.aiProvider
    })
  }
  get currentAdapter(): ChatAdapterInterface | undefined {
    return this.currentProvider
      ? this.adapters[this.currentProvider]
      : undefined
  }
  private initChatSystem() {
    createBackgroundMessageListener(async (runtime, event, data, sender) => {
      if (runtime === 'client') {
        switch (event as ISearchWithAISendEvent) {
          case 'SWAI_switchAIProvider': {
            const { provider } = data
            await this.switchAdapter(provider)
            await this.preAuth()
            return {
              success: true,
              data: provider,
              message: '',
            }
            break
          }

          case 'SWAI_askAIQuestion': {
            // 特殊处理
            // 为了不在 auth 时自动弹出登录窗口，
            if (
              this.currentProvider !== SEARCH_WITH_AI_PROVIDER_MAP.BARD &&
              this.currentProvider !== SEARCH_WITH_AI_PROVIDER_MAP.CLAUDE &&
              this.currentProvider !== SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_FREE
            ) {
              await this.auth(sender.tab?.id || 0)
            }
            const taskId = data.taskId
            const question = data.question
            await this.createConversation(question.conversationId)
            await this.sendQuestion(taskId, sender, question)
            return {
              success: true,
              data: {},
              message: '',
            }
            break
          }
          case 'SWAI_abortAskChatGPTQuestion': {
            const { taskId } = data
            await this.abortAskQuestion(taskId)
            return {
              success: true,
              data: {},
              message: '',
            }
          }

          default:
            break
        }
      }
      return undefined
    })
  }
  async switchAdapter(provider: ISearchWithAIProviderType) {
    await this.destroy()
    this.currentProvider = provider
    await setSearchWithAISettings({ aiProvider: provider })
    return this.currentAdapter
  }
  async auth(authTabId: number) {
    if (this.currentAdapter) {
      await this.currentAdapter.auth(authTabId)
    }
  }
  async preAuth() {
    if (this.currentAdapter) {
      await this.currentAdapter.preAuth()
    }
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = (
    taskId,
    sender,
    question,
  ) => {
    if (this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.OPENAI_API) {
      question.meta = {
        model:
          SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER[
            SEARCH_WITH_AI_PROVIDER_MAP.OPENAI_API
          ],
        temperature: 1,
      }
    }

    if (
      this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS
    ) {
      question.meta = {
        temperature: 1,
      }
    }

    return (
      this.currentAdapter?.sendQuestion(taskId, sender, question) ||
      Promise.resolve()
    )
  }
  async abortAskQuestion(taskId: string) {
    if (this.currentAdapter) {
      return await this.currentAdapter.abortAskQuestion(taskId)
    }
    return false
  }

  async createConversation(conversationId: string) {
    if (!this.currentAdapter) {
      return ''
    }

    const meta = {
      AIModel: '',
    }

    // 传入写死的 model name
    if (this.currentProvider) {
      meta.AIModel =
        SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER[this.currentProvider]
    }

    this.currentAIModel = meta.AIModel

    return (
      (await this.currentAdapter?.createConversation({
        id: conversationId,
        title: 'Chat - Search With AI',
        type: 'Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
        meta,
      })) || ''
    )
  }
  // async removeConversation(conversationId: string) {
  //   if (!this.currentAdapter || !conversationId) {
  //     return false
  //   }
  //   // return result
  // }
  async destroy() {
    await this.currentAdapter?.removeConversation('')
    await this.currentAdapter?.destroy()
  }
}
export default SearchWIthAIChatSystem
