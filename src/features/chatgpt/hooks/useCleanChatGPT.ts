import { useRecoilState } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import { setChromeExtensionSettings } from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHAT_GPT_MESSAGES_RECOIL_KEY } from '@/constants'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
import { ChatGPTMessageState } from '@/features/chatgpt/store'
import clientGetLiteChromeExtensionSettings from '@/utils/clientGetLiteChromeExtensionSettings'
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useCleanChatGPT = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const [, setChatGPTMessages] = useRecoilState(ChatGPTMessageState)
  const [, setConversation] = useRecoilState(ChatGPTConversationState)
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
    setChatGPTMessages([])
    // 清空本地储存的message
    await Browser.storage.local.set({
      [CHAT_GPT_MESSAGES_RECOIL_KEY]: JSON.stringify([]),
    })
    setAppSettings({
      conversationId: '',
    })
    // 清空本地储存的conversationId
    await setChromeExtensionSettings({
      conversationId: '',
    })
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
