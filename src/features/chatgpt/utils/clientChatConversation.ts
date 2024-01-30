import { IAIProviderType } from '@/background/provider/chat'
import { BARD_MODELS } from '@/background/src/chat/BardChat/types'
import { BING_MODELS } from '@/background/src/chat/BingChat/bing/types'
import { CLAUDE_MODELS } from '@/background/src/chat/ClaudeWebappChat/claude/types'
import { MAXAI_CLAUDE_MODELS } from '@/background/src/chat/MaxAIClaudeChat/types'
import { MAXAI_GENMINI_MODELS } from '@/background/src/chat/MaxAIGeminiChat/types'
import { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat'
import { POE_MODELS } from '@/background/src/chat/PoeChat/type'
import { USE_CHAT_GPT_PLUS_MODELS } from '@/background/src/chat/UseChatGPTChat/types'
import { IChatConversation } from '@/background/src/chatConversations'
import { getChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import {
  IAIProviderModel,
  IAIResponseMessage,
  IChatMessage,
  ISystemChatMessage,
  IUserChatMessage,
} from '@/features/chatgpt/types'

/**
 * Client更新Conversation的信息
 * @param action
 * @param conversationId
 * @param deleteCount
 * @param newMessages
 */
export const clientChatConversationModifyChatMessages = async (
  action: 'add' | 'delete' | 'clear' | 'update',
  conversationId: string,
  deleteCount: number,
  newMessages: Array<
    IChatMessage | ISystemChatMessage | IAIResponseMessage | IUserChatMessage
  >,
) => {
  try {
    console.log(
      'clientChatConversationModifyChatMessages',
      action,
      conversationId,
      newMessages,
    )
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_modifyMessages',
      data: {
        conversationId,
        action,
        deleteCount,
        newMessages,
      },
    })
    return result.success
  } catch (e) {
    return false
  }
}

/**
 * Client更新Conversation的信息
 * @param conversationId - 需要更新的conversationId
 * @param updateConversationData - 需要更新的数据
 * @param syncConversationToDB - 是否同步到服务器
 */

export const clientUpdateChatConversation = async (
  conversationId: string,
  updateConversationData: Partial<IChatConversation>,
  syncConversationToDB: boolean,
) => {
  try {
    const port = new ContentScriptConnectionV2()
    const result = await port.postMessage({
      event: 'Client_updateConversation',
      data: {
        conversationId,
        updateConversationData,
        syncConversationToDB,
      },
    })
    return result.success
  } catch (e) {
    return false
  }
}

/**
 * 获取客户端目前使用的AIProvider和Model
 */
export const clientGetCurrentClientAIProviderAndModel = async (): Promise<{
  currentAIProvider: IAIProviderType
  currentModel: IAIProviderModel | null
  currentModelValue: string
}> => {
  const settings = await getChromeExtensionLocalStorage()
  const currentAIProvider =
    settings.sidebarSettings?.common?.currentAIProvider || 'USE_CHAT_GPT_PLUS'
  const currentModelValue =
    settings.thirdProviderSettings?.[currentAIProvider]?.model ||
    'gpt-3.5-turbo'
  let currentModel: IAIProviderModel | null = null
  const findModelDetail = (models: IAIProviderModel[]) => {
    currentModel =
      models.find((model) => model.value === currentModelValue) || models[0]
  }
  switch (currentAIProvider) {
    case 'MAXAI_GEMINI':
      findModelDetail(MAXAI_GENMINI_MODELS)
      break
    case 'MAXAI_CLAUDE':
      findModelDetail(MAXAI_CLAUDE_MODELS)
      break
    case 'USE_CHAT_GPT_PLUS':
      findModelDetail(USE_CHAT_GPT_PLUS_MODELS)
      break
    case 'CLAUDE':
      findModelDetail(CLAUDE_MODELS)
      break
    case 'BING':
      findModelDetail(BING_MODELS)
      break
    case 'BARD':
      findModelDetail(BARD_MODELS)
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
      break
    case 'OPENAI_API':
      findModelDetail(OPENAI_API_MODELS)
      break
    case 'POE':
      findModelDetail(POE_MODELS)
      break
    default:
      findModelDetail(USE_CHAT_GPT_PLUS_MODELS)
  }
  return {
    currentAIProvider,
    currentModel,
    currentModelValue,
  }
}
