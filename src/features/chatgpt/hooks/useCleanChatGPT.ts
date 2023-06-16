import { useRecoilState } from 'recoil'
import {
  ChatGPTConversationState,
  ChatGPTMessageState,
} from '@/features/gmail/store'
import { setChromeExtensionSettings } from '@/background/utils'
import Browser from 'webextension-polyfill'
import { CHAT_GPT_MESSAGES_RECOIL_KEY } from '@/constants'
import { AppSettingsState } from '@/store'

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
