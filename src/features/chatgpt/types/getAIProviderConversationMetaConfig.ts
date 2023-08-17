import { IAIProviderType } from '@/background/provider/chat'
import { IChatConversationMeta } from '@/background/src/chatConversations'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
import { OPENAI_API_SYSTEM_MESSAGE } from '@/background/src/chat/OpenAIApiChat/types'

export const getAIProviderConversationMetaConfig = async (
  provider?: IAIProviderType,
) => {
  const currentSettings = await clientGetLiteChromeExtensionSettings()
  const baseMetaConfig: Partial<IChatConversationMeta> = {
    AIProvider: currentSettings.currentAIProvider,
    AIModel:
      currentSettings.thirdProviderSettings?.[
        currentSettings.currentAIProvider as 'USE_CHAT_GPT_PLUS'
      ]?.model || '',
  }
  if (provider === 'OPENAI_API') {
    baseMetaConfig.systemPrompt = OPENAI_API_SYSTEM_MESSAGE
  }
  return baseMetaConfig
}
