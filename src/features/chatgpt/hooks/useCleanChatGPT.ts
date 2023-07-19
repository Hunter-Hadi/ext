import { useRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  ChatGPTMessageState,
} from '@/features/sidebar/store'
import { setChromeExtensionSettings } from '@/background/utils'
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
    setChatGPTMessages([])
    // 清空本地储存的message
    await Browser.storage.local.set({
      [CHAT_GPT_MESSAGES_RECOIL_KEY]: JSON.stringify([]),
    })
    setConversation({
      model: appSettings.currentModel || '',
      conversationId: '',
      writingMessage: null,
      loading: false,
    })
    port
      .postMessage({
        event: 'Client_removeChatGPTConversation',
        data: {},
      })
      .then()
      .catch()
      .finally(async () => {
        // 清空本地储存的conversationId
        await setChromeExtensionSettings({
          conversationId: '',
        })
      })
  }
  return {
    cleanChatGPT,
  }
}
export { useCleanChatGPT }
