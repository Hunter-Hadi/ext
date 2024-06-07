import { IAIProviderType } from '@/background/provider/chat'
import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import { BING_MODELS } from '@/background/src/chat/BingChat/bing/types'
import { CLAUDE_MODELS } from '@/background/src/chat/ClaudeWebappChat/claude/types'
import { MAXAI_CLAUDE_MODELS } from '@/background/src/chat/MaxAIClaudeChat/types'
import { MAXAI_GENMINI_MODELS } from '@/background/src/chat/MaxAIGeminiChat/types'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { POE_MODELS } from '@/background/src/chat/PoeChat/type'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import {
  getChromeExtensionLocalStorage,
  MAXAI_DEFAULT_AI_PROVIDER_CONFIG,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'

/**
 * @deprecated 由于 context window 分离，导致这里获取不到 正确的 conversation, 要获取正确的用 useClientConversation
 */
export const clientGetCurrentClientAIProviderAndModel = async (): Promise<{
  currentAIProvider: IAIProviderType
  currentModel: IAIProviderModel | null
  currentModelValue: string
  isThirdPartyProvider: boolean
}> => {
  const settings = await getChromeExtensionLocalStorage()
  const currentChatConversationId =
    settings.sidebarSettings?.chat?.conversationId

  // set default
  let currentAIProvider = MAXAI_DEFAULT_AI_PROVIDER_CONFIG.Chat.AIProvider
  let currentModelValue = MAXAI_DEFAULT_AI_PROVIDER_CONFIG.Chat.AIModel

  if (currentChatConversationId) {
    const currentChatConversation =
      await ClientConversationManager.getConversationById(
        currentChatConversationId,
      )
    currentAIProvider =
      currentChatConversation?.meta.AIProvider || currentAIProvider
    currentModelValue =
      currentChatConversation?.meta.AIModel || currentModelValue
  }

  let currentModel: IAIProviderModel | null = null
  let isThirdPartyProvider = false
  const findModelDetail = (models: IAIProviderModel[]) => {
    currentModel =
      models.find((model) => model.value === currentModelValue) || models[0]
  }
  switch (currentAIProvider) {
    case 'MAXAI_GEMINI':
      findModelDetail(MAXAI_GENMINI_MODELS)
      isThirdPartyProvider = false
      break
    case 'MAXAI_CLAUDE':
      findModelDetail(MAXAI_CLAUDE_MODELS)
      isThirdPartyProvider = false
      break
    case 'USE_CHAT_GPT_PLUS':
      findModelDetail(USE_CHAT_GPT_PLUS_MODELS)
      isThirdPartyProvider = false
      break
    case 'CLAUDE':
      findModelDetail(CLAUDE_MODELS)
      isThirdPartyProvider = true
      break
    case 'BING':
      findModelDetail(BING_MODELS)
      isThirdPartyProvider = true
      break
    case 'BARD':
      findModelDetail(BARD_MODELS)
      isThirdPartyProvider = true
      break
    case 'OPENAI':
      findModelDetail(
        (settings.thirdProviderSettings?.OPENAI?.modelOptions || []).map(
          (OpenAIModel) => {
            return {
              title: OpenAIModel.title,
              value: OpenAIModel.slug,
              titleTag:
                OpenAIModel.tags?.find((tag) =>
                  tag.toLowerCase().includes('beta'),
                ) ||
                OpenAIModel.tags?.find((tag) =>
                  tag.toLowerCase().includes('mobile'),
                ) ||
                '',
              maxTokens: OpenAIModel.max_tokens,
              tags: OpenAIModel.tags || [],
              description: (t) => '',
            }
          },
        ),
      )
      isThirdPartyProvider = true
      break
    case 'OPENAI_API':
      findModelDetail(OPENAI_API_MODELS)
      isThirdPartyProvider = true
      break
    case 'POE':
      findModelDetail(POE_MODELS)
      isThirdPartyProvider = true
      break
    default:
      findModelDetail(USE_CHAT_GPT_PLUS_MODELS)
  }
  return {
    currentAIProvider,
    currentModel,
    currentModelValue,
    isThirdPartyProvider,
  }
}
