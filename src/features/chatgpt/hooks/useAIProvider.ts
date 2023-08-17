import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { IAIProviderType } from '@/background/provider/chat'
import { setChromeExtensionSettings } from '@/background/utils'
import { useState } from 'react'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
import { md5TextEncrypt } from '@/utils/encryptionHelper'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'

const useAIProvider = () => {
  const [loading, setLoading] = useState(false)
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const { changeConversation, switchBackgroundChatSystemAIProvider } =
    useClientConversation()
  const updateChatGPTProvider = async (provider: IAIProviderType) => {
    try {
      setLoading(true)
      const cache = await clientGetLiteChromeExtensionSettings()
      const cacheModel = cache.thirdProviderSettings?.[provider]?.model
      let conversationId = ''
      if (cacheModel) {
        const providerConversationId = md5TextEncrypt(provider + cacheModel)
        const providerConversation = await clientGetConversation(
          providerConversationId,
        )
        console.log(
          '新版Conversation 切换AI Provider，获取 conversation id',
          providerConversationId,
          providerConversation,
          '\n',
          provider,
          cacheModel,
        )
        conversationId = providerConversation?.id || ''
      }
      // 更新本地储存的provider
      setAppSettings((prevState) => {
        return {
          ...prevState,
          currentAIProvider: provider,
          conversationId,
        }
      })
      await setChromeExtensionSettings({
        currentAIProvider: provider,
        conversationId,
      })
      setTimeout(async () => {
        const currentSettings = await clientGetLiteChromeExtensionSettings()
        // 如果有conversationId，则复原conversation
        if (
          conversationId &&
          conversationId === currentSettings.conversationId
        ) {
          await changeConversation(conversationId)
        } else {
          // 如果没有conversationId，则只是切换background的provider
          await switchBackgroundChatSystemAIProvider(provider)
        }
      }, 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  return {
    provider: appSettings.currentAIProvider,
    updateChatGPTProvider,
    loading,
  }
}
export default useAIProvider
