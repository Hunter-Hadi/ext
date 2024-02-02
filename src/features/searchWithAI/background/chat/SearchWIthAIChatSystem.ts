import { ChatAdapterInterface } from '@/background/provider/chat'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'
import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import { BING_MODELS } from '@/background/src/chat/BingChat/bing/types'
import { CLAUDE_MODELS } from '@/background/src/chat/ClaudeWebappChat/claude/types'
import { MAXAI_CLAUDE_MODELS } from '@/background/src/chat/MaxAIClaudeChat/types'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import { createBackgroundMessageListener } from '@/background/utils'

import { CHATGPT_3_5_MODEL_NAME } from '../../chatCore/chatgpt/constants'
import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_PROVIDER_MAP,
} from '../../constants'
import {
  getSearchWithAISettings,
  setSearchWithAISettings,
} from '../../utils/searchWithAISettings'
import { ISearchWithAISendEvent } from '../eventType'
import { initProviderChatAdapters } from '../utils'

class SearchWIthAIChatSystem {
  currentProvider?: ISearchWithAIProviderType
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
        model: OPENAI_API_MODELS[0].value,
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
    if (
      this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS
    ) {
      meta.AIModel = USE_CHAT_GPT_PLUS_MODELS[0].value
    }
    if (this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_CLAUDE) {
      meta.AIModel = MAXAI_CLAUDE_MODELS[0].value
    }
    if (this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.OPENAI_API) {
      meta.AIModel = OPENAI_API_MODELS[0].value
    }
    if (this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.OPENAI) {
      meta.AIModel = CHATGPT_3_5_MODEL_NAME
    }
    if (this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.CLAUDE) {
      meta.AIModel = CLAUDE_MODELS[0].value
    }
    if (this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.BARD) {
      meta.AIModel = BARD_MODELS[0].value
    }
    if (this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.BING) {
      meta.AIModel = BING_MODELS[0].value
    }

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
