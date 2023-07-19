import { useRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  ChatGPTMessageState,
} from '@/features/sidebar/store'
import {
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHAT_GPT_MESSAGES_RECOIL_KEY } from '@/constants'
import { AppSettingsState } from '@/store'
import { ContentScriptConnectionV2 } from '@/features/chatgpt'
const port = new ContentScriptConnectionV2({
  runtime: 'client',
})
const useCleanChatGPT = () => {
  const [appSettings] = useRecoilState(AppSettingsState)
  const [, setChatGPTMessages] = useRecoilState(ChatGPTMessageState)
  const [, setConversation] = useRecoilState(ChatGPTConversationState)
  const cleanChatGPT = async () => {
    const cache = await getChromeExtensionSettings()
    if (cache.conversationId) {
      port
        .postMessage({
          event: 'Client_removeChatGPTConversation',
          data: {
            conversationId: cache.conversationId,
          },
        })
        .then()
        .catch()
    }
    setChatGPTMessages([])
    // 清空本地储存的message
    await Browser.storage.local.set({
      [CHAT_GPT_MESSAGES_RECOIL_KEY]: JSON.stringify([]),
    })
    // 清空本地储存的conversationId
    await setChromeExtensionSettings({
      conversationId: '',
    })
    setConversation({
      model: appSettings.currentModel || '',
      conversationId: '',
      writingMessage: null,
      loading: false,
    })
  }
  return {
    cleanChatGPT,
  }
}
export { useCleanChatGPT }
