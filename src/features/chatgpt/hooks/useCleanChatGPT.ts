import { useRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  SidebarSettingsState,
} from '@/features/sidebar/store'
import { setChromeExtensionSettings } from '@/background/utils'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
import { setPageSummaryConversationId } from '@/features/sidebar/utils/pageSummaryHelper'
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
    setAppSettings((prevState) => {
      return {
        ...prevState,
        conversationId: '',
      }
    })
    if (sidebarSettings.type === 'Chat') {
      // 清空本地储存的conversationId
      await setChromeExtensionSettings({
        conversationId: '',
      })
    } else {
      // 清除pageSummary的conversationId
      await setPageSummaryConversationId('')
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
