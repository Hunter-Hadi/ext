import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { IChatGPTProviderType } from '@/background/provider/chat'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import { setChromeExtensionSettings } from '@/background/utils'
import { useCleanChatGPT } from '@/features/chatgpt/hooks/useCleanChatGPT'
import useSyncSettingsChecker from '@/pages/options/hooks/useSyncSettingsChecker'
import dayjs from 'dayjs'
import { useState } from 'react'

const port = new ContentScriptConnectionV2()
const useChatGPTProvider = () => {
  const { checkSync } = useSyncSettingsChecker()
  const { cleanChatGPT } = useCleanChatGPT()
  const [loading, setLoading] = useState(false)
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const updateChatGPTProvider = async (provider: IChatGPTProviderType) => {
    try {
      setLoading(true)
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
        const lastModified = dayjs().utc().valueOf()
        await setChromeExtensionSettings((settings) => {
          if (settings.lastModified) {
            // 说明已经登陆了，更新最后修改时间
            return {
              ...settings,
              chatGPTProvider: provider,
              lastModified,
            }
          } else {
            return {
              ...settings,
              chatGPTProvider: provider,
            }
          }
        })
        await checkSync()
        await cleanChatGPT()
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
