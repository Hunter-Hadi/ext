import { ChatAdapterInterface } from '@/background/provider/chat'
import { createBackgroundMessageListener } from '@/background/utils'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'
import { ISearchWithAISendEvent } from '../eventType'
import {
  getSearchWithAISettings,
  setSearchWithAISettings,
} from '../../utils/searchWithAISettings'
import {
  BardChatProvider,
  BingChatProvider,
  ChatAdapter,
  ClaudeChatProvider,
  MaxAIClaudeChatProvider,
  OpenAIApiChatProvider,
  UseChatGPTPlusChatProvider,
} from '@/background/provider/chat'
import {
  BardChat,
  BingChat,
  ClaudeWebappChat,
  MaxAIClaudeChat,
  OpenAiApiChat,
  UseChatGPTPlusChat,
} from '@/background/src/chat'
import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_PROVIDER_MAP,
} from '../../constants'

import { OpenAIChatProvider } from '../provider/OpenAIChatProvider'
import { OpenAIChat } from './OpenAiChat/index'
import { MAXAI_CLAUDE_MODELS } from '@/background/src/chat/MaxAIClaudeChat/types'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { CHATGPT_3_5_MODEL_NAME } from '../../chatCore/chatgpt/constants'
import { CLAUDE_MODELS } from '@/background/src/chat/ClaudeWebappChat/claude/types'
import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import { BING_MODELS } from '@/background/src/chat/BingChat/bing/types'

class SearchWIthAIChatSystem {
  currentProvider?: ISearchWithAIProviderType
  private adapters: {
    [key in ISearchWithAIProviderType]?: ChatAdapterInterface
  } = {}
  constructor() {
    const openAIChatAdapter = new ChatAdapter(
      new OpenAIChatProvider(new OpenAIChat() as any) as any,
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
      [SEARCH_WITH_AI_PROVIDER_MAP.OPENAI]: openAIChatAdapter,
      [SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS]: useChatGPTPlusAdapter,
      [SEARCH_WITH_AI_PROVIDER_MAP.OPENAI_API]: newOpenAIApiChatAdapter,
      [SEARCH_WITH_AI_PROVIDER_MAP.BARD]: bardChatAdapter,
      [SEARCH_WITH_AI_PROVIDER_MAP.BING]: bingChatAdapter,
      [SEARCH_WITH_AI_PROVIDER_MAP.CLAUDE]: claudeChatAdapter,
      [SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_CLAUDE]: maxAIClaudeAdapter,
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
            return {
              success: true,
              data: provider,
              message: '',
            }
            break
          }

          case 'SWAI_askAIQuestion': {
            // 特殊处理
            // 为了不在 auth 时自动弹出登录窗口， 在bard 和 claude 时不执行 auth
            if (
              this.currentProvider !== SEARCH_WITH_AI_PROVIDER_MAP.BARD &&
              this.currentProvider !== SEARCH_WITH_AI_PROVIDER_MAP.CLAUDE
            ) {
              await this.auth(sender.tab?.id || 0)
            }
            const taskId = data.taskId
            const question = data.question
            const options = data.options
            await this.createConversation(question.conversationId)
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
    data,
    options,
  ) => {
    if (this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.OPENAI_API) {
      options.meta = {
        model: OPENAI_API_MODELS[0].value,
        temperature: 0,
      }
    }

    if (
      this.currentProvider === SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS
    ) {
      options.meta = {
        temperature: 0,
      }
    }

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
  //   debugger
  //   // return result
  // }
  async destroy() {
    await this.currentAdapter?.removeConversation('')
    await this.currentAdapter?.destroy()
  }
}
export default SearchWIthAIChatSystem
