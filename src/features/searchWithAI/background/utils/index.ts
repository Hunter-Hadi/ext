import {
  BardChatProvider,
  BingChatProvider,
  ChatAdapter,
  ClaudeChatProvider,
  MaxAIClaudeChatProvider,
  MaxAIFreeChatProvider,
  OpenAIApiChatProvider,
  UseChatGPTPlusChatProvider,
} from '@/background/provider/chat'
import {
  BardChat,
  BingChat,
  ClaudeWebappChat,
  MaxAIClaudeChat,
  MaxAIFreeChat,
  OpenAIApiChat,
  UseChatGPTPlusChat,
} from '@/background/src/chat'

import { SEARCH_WITH_AI_PROVIDER_MAP } from '../../constants'
import { OpenAIChat } from '../chat/OpenAiChat'
import { OpenAIChatProvider } from '../provider/OpenAIChatProvider'

export const initProviderChatAdapters = () => {
  const openAIChatAdapter = new ChatAdapter(
    new OpenAIChatProvider(new OpenAIChat() as any) as any,
  )
  const useChatGPTPlusAdapter = new ChatAdapter(
    new UseChatGPTPlusChatProvider(new UseChatGPTPlusChat()),
  )
  const newOpenAIApiChatAdapter = new ChatAdapter(
    new OpenAIApiChatProvider(new OpenAIApiChat()),
  )
  const bardChatAdapter = new ChatAdapter(new BardChatProvider(new BardChat()))
  const bingChatAdapter = new ChatAdapter(new BingChatProvider(new BingChat()))
  const claudeChatAdapter = new ChatAdapter(
    new ClaudeChatProvider(new ClaudeWebappChat()),
  )
  const maxAIClaudeAdapter = new ChatAdapter(
    new MaxAIClaudeChatProvider(new MaxAIClaudeChat()),
  )

  const maxAIFreeAdapter = new ChatAdapter(
    new MaxAIFreeChatProvider(new MaxAIFreeChat()),
  )

  return {
    [SEARCH_WITH_AI_PROVIDER_MAP.OPENAI]: openAIChatAdapter,
    [SEARCH_WITH_AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS]: useChatGPTPlusAdapter,
    [SEARCH_WITH_AI_PROVIDER_MAP.OPENAI_API]: newOpenAIApiChatAdapter,
    [SEARCH_WITH_AI_PROVIDER_MAP.BARD]: bardChatAdapter,
    [SEARCH_WITH_AI_PROVIDER_MAP.BING]: bingChatAdapter,
    [SEARCH_WITH_AI_PROVIDER_MAP.CLAUDE]: claudeChatAdapter,
    [SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_CLAUDE]: maxAIClaudeAdapter,
    [SEARCH_WITH_AI_PROVIDER_MAP.MAXAI_FREE]: maxAIFreeAdapter,
  }
}
