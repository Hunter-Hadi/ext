import { useRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  SidebarSettingsState,
} from '@/features/sidebar/store'
import { setChromeExtensionSettings } from '@/background/utils'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useCleanChatGPT = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const [, setConversation] = useRecoilState(ChatGPTConversationState)
  const [sidebarSettings, updateSidebarSettings] =
    useRecoilState(SidebarSettingsState)
  const cleanChatGPT = async () => {
    const cache = await clientGetLiteChromeExtensionSettings()
    port
      .postMessage({
        event: 'Client_removeChatGPTConversation',
        data: {
          conversationId: cache.conversationId,
        },
      })
      .then()
      .catch()
    if (sidebarSettings.type === 'Chat') {
      setAppSettings((prevState) => {
        return {
          ...prevState,
          conversationId: '',
        }
      })
      // 清空本地储存的conversationId
      await setChromeExtensionSettings({
        conversationId: '',
      })
    } else {
      updateSidebarSettings((prevState) => {
        return {
          ...prevState,
          summaryConversationId: '',
        }
      })
    }
    setConversation({
      model: appSettings.currentModel || '',
      writingMessage: null,
      loading: false,
    })
  }
  return {
    cleanChatGPT,
  }
}
export { useCleanChatGPT }
