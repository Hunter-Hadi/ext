import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { IAIProviderType } from '@/background/provider/chat'
import { setChromeExtensionSettings } from '@/background/utils'
import { useEffect, useRef, useState } from 'react'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
import { md5TextEncrypt } from '@/utils/encryptionHelper'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'

const useAIProvider = () => {
  const [loading, setLoading] = useState(false)
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const { changeConversation, switchBackgroundChatSystemAIProvider } =
    useClientConversation()
  const currentAIProviderRef = useRef(appSettings.currentAIProvider)
  useEffect(() => {
    currentAIProviderRef.current = appSettings.currentAIProvider
  }, [appSettings.currentAIProvider])
  const updateChatGPTProvider = async (provider: IAIProviderType) => {
    try {
      setLoading(true)
      const cache = await clientGetLiteChromeExtensionSettings()
      const prevConversation = cache.chatTypeConversationId
        ? await clientGetConversation(cache.chatTypeConversationId)
        : undefined
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
        conversationId = providerConversationId
      }
      // 更新本地储存的provider
      setAppSettings((prevState) => {
        return {
          ...prevState,
          currentAIProvider: provider,
          chatTypeConversationId: conversationId,
        }
      })
      await setChromeExtensionSettings({
        currentAIProvider: provider,
        chatTypeConversationId: conversationId,
      })
      setTimeout(async () => {
        const currentSettings = await clientGetLiteChromeExtensionSettings()
        // 如果之前的conversation存在，且AIProvider没有变化，则切换conversation
        if (
          prevConversation?.meta.AIProvider &&
          prevConversation?.meta.AIProvider ===
            currentSettings.currentAIProvider
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
    currentAIProviderRef,
    provider: appSettings.currentAIProvider,
    updateChatGPTProvider,
    loading,
  }
}
export default useAIProvider
