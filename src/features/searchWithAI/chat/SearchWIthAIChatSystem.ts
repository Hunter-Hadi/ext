import {
  ChatAdapterInterface,
  IAIProviderType,
} from '@/background/provider/chat'
import { createBackgroundMessageListener } from '@/background/utils'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'
import { ISearchWithAISendEvent } from '../background/eventType'
import {
  DEFAULT_SEARCH_WITH_AI_SETTING,
  getSearchWithAISettings,
  setSearchWithAISettings,
} from '../utils/searchWithAISettings'
import { AI_PROVIDER_MAP } from '@/constants'
import {
  BardChatProvider,
  BingChatProvider,
  ChatAdapter,
  ClaudeChatProvider,
  MaxAIClaudeChatProvider,
  OpenAIApiChatProvider,
  OpenAIChatProvider,
  UseChatGPTPlusChatProvider,
} from '@/background/provider/chat'
import {
  BardChat,
  BingChat,
  ClaudeWebappChat,
  MaxAIClaudeChat,
  OpenAiApiChat,
  OpenAIChat,
  UseChatGPTPlusChat,
} from '@/background/src/chat'

class SearchWIthAIChatSystem {
  currentProvider?: IAIProviderType
  private adapters: {
    [key in IAIProviderType]?: ChatAdapterInterface
  } = {}
  constructor() {
    const openAIChatAdapter = new ChatAdapter(
      new OpenAIChatProvider(new OpenAIChat()),
    )
    const useChatGPTPlusAdapter = new ChatAdapter(
      new UseChatGPTPlusChatProvider(new UseChatGPTPlusChat()),
    )
    const newOpenAIApiChatAdapter = new ChatAdapter(
      new OpenAIApiChatProvider(new OpenAiApiChat()),
    )
    const bardChatAdapter = new ChatAdapter(
      new BardChatProvider(new BardChat()),
    )
    const bingChatAdapter = new ChatAdapter(
      new BingChatProvider(new BingChat()),
    )
    const claudeChatAdapter = new ChatAdapter(
      new ClaudeChatProvider(new ClaudeWebappChat()),
    )
    const maxAIClaudeAdapter = new ChatAdapter(
      new MaxAIClaudeChatProvider(new MaxAIClaudeChat()),
    )
    this.adapters = {
      [AI_PROVIDER_MAP.OPENAI]: openAIChatAdapter,
      [AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS]: useChatGPTPlusAdapter,
      [AI_PROVIDER_MAP.OPENAI_API]: newOpenAIApiChatAdapter,
      [AI_PROVIDER_MAP.BARD]: bardChatAdapter,
      [AI_PROVIDER_MAP.BING]: bingChatAdapter,
      [AI_PROVIDER_MAP.CLAUDE]: claudeChatAdapter,
      [AI_PROVIDER_MAP.MAXAI_CLAUDE]: maxAIClaudeAdapter,
    }

    this.initChatSystem()

    // init default current provider
    getSearchWithAISettings().then((settings) => {
      this.currentProvider = settings.aiProvider
    })
  }
  get conversation() {
    return this.currentAdapter?.conversation
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
            await this.auth(sender.tab?.id || 0)
            return {
              success: true,
              data: provider,
              message: '',
            }
            break
          }

          case 'SWAI_askAIQuestion': {
            const taskId = data.taskId
            const question = data.question
            const options = data.options
            await this.sendQuestion(taskId, sender, question, options)
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
  async switchAdapter(provider: IAIProviderType) {
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
    data,
    options,
  ) => {
    return (
      this.currentAdapter?.sendQuestion(taskId, sender, data, options) ||
      Promise.resolve()
    )
  }
  async abortAskQuestion(taskId: string) {
    if (this.currentAdapter) {
      return await this.currentAdapter.abortAskQuestion(taskId)
    }
    return false
  }

  // async createConversation() {
  //   if (!this.currentAdapter) {
  //     return ''
  //   }
  //   debugger
  //   // return (
  //   //   (await this.currentAdapter?.createConversation(initConversationData)) ||
  //   //   ''
  //   // )
  // }
  // async removeConversation(conversationId: string) {
  //   if (!this.currentAdapter || !conversationId) {
  //     return false
  //   }
  //   debugger
  //   // return result
  // }
  async destroy() {
    await this.currentAdapter?.removeConversation('')
    await this.currentAdapter?.destroy()
  }
}
export default SearchWIthAIChatSystem
