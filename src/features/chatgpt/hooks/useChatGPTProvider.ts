import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { IAIProviderType } from '@/background/provider/chat'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { setChromeExtensionSettings } from '@/background/utils'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import { useState } from 'react'

const port = new ContentScriptConnectionV2()
const useChatGPTProvider = () => {
  const { cleanConversation } = useClientConversation()
  const [loading, setLoading] = useState(false)
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const updateChatGPTProvider = async (provider: IAIProviderType) => {
    try {
      setLoading(true)
      await cleanConversation()
      const result = await port.postMessage({
        event: 'Client_switchChatGPTProvider',
        data: {
          provider: provider,
        },
      })
      if (result.success) {
        console.log('updateChatGPTProvider switch new provider', provider)
        setAppSettings((prevState) => {
          return {
            ...prevState,
            chatGPTProvider: provider,
          }
        })
        await setChromeExtensionSettings({
          chatGPTProvider: provider,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }
  return {
    provider: appSettings.chatGPTProvider,
    updateChatGPTProvider,
    loading,
  }
}
export default useChatGPTProvider
