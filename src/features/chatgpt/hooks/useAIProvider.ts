import { useRecoilState } from 'recoil'
import { AppLocalStorageState } from '@/store'
import { IAIProviderType } from '@/background/provider/chat'
import { useEffect, useRef, useState } from 'react'
import { md5TextEncrypt } from '@/utils/encryptionHelper'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'

const useAIProvider = () => {
  const [loading, setLoading] = useState(false)
  const [appLocalStorage, setAppLocalStorage] = useRecoilState(
    AppLocalStorageState,
  )
  const {
    changeConversation,
    switchBackgroundChatSystemAIProvider,
  } = useClientConversation()
  const currentAIProviderRef = useRef(
    appLocalStorage.sidebarSettings?.common?.currentAIProvider,
  )
  useEffect(() => {
    currentAIProviderRef.current =
      appLocalStorage.sidebarSettings?.common?.currentAIProvider
  }, [appLocalStorage.sidebarSettings?.common?.currentAIProvider])
  const updateChatGPTProvider = async (provider: IAIProviderType) => {
    try {
      setLoading(true)
      const cache = await getChromeExtensionLocalStorage()
      const prevConversation = cache.sidebarSettings?.chat?.conversationId
        ? await clientGetConversation(
            cache.sidebarSettings?.chat.conversationId,
          )
        : undefined
      const newProviderModel =
        cache.thirdProviderSettings?.[provider]?.model || ''
      let conversationId = ''
      if (newProviderModel) {
        const providerConversationId = md5TextEncrypt(
          provider + newProviderModel,
        )
        const providerConversation = await clientGetConversation(
          providerConversationId,
        )
        console.log(
          '新版Conversation 切换AI Provider，获取 conversation id',
          providerConversationId,
          providerConversation,
          '\n',
          provider,
          newProviderModel,
        )
        conversationId = providerConversationId
      }
      // 更新本地储存的provider
      setAppLocalStorage((prevState) => {
        return {
          ...prevState,
          sidebarSettings: {
            ...prevState.sidebarSettings,
            chat: {
              ...prevState.sidebarSettings?.chat,
              conversationId,
            },
            common: {
              ...prevState.sidebarSettings?.common,
              currentAIProvider: provider,
            },
          },
        }
      })
      await setChromeExtensionLocalStorage({
        sidebarSettings: {
          chat: {
            conversationId,
          },
          common: {
            currentAIProvider: provider,
          },
        },
      })
      setTimeout(async () => {
        const currentSettings = await getChromeExtensionLocalStorage()
        // 如果之前的conversation存在，且AIProvider没有变化，则切换conversation
        if (
          prevConversation?.meta.AIProvider &&
          prevConversation?.meta.AIProvider ===
            currentSettings.sidebarSettings?.common?.currentAIProvider
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
    provider: appLocalStorage.sidebarSettings?.common?.currentAIProvider,
    updateChatGPTProvider,
    loading,
  }
}
export default useAIProvider
