import { useRecoilState } from 'recoil'
import { AppSettingsState } from '@/store'
import { IChatGPTProviderType } from '@/background/provider/chat'
import { ContentScriptConnectionV2 } from '@/features/chatgpt/utils'
import Browser from 'webextension-polyfill'
import { CHAT_GPT_MESSAGES_RECOIL_KEY } from '@/types'
import { setChromeExtensionSettings } from '@/background/utils'
import { ChatGPTMessageState } from '@/features/gmail/store'

const port = new ContentScriptConnectionV2()
const useChatGPTProvider = () => {
  const [appSettings, setAppSettings] = useRecoilState(AppSettingsState)
  const [, setChatGPTMessages] = useRecoilState(ChatGPTMessageState)
  const updateChatGPTProvider = async (provider: IChatGPTProviderType) => {
    setAppSettings((prevState) => {
      return {
        ...prevState,
        chatGPTProvider: provider,
      }
    })
    setChatGPTMessages([])
    // 清空本地储存的message
    await Browser.storage.local.set({
      [CHAT_GPT_MESSAGES_RECOIL_KEY]: JSON.stringify([]),
    })
    // 清空本地储存的conversationId
    await setChromeExtensionSettings({
      conversationId: '',
    })
    await port.postMessage({
      event: 'Client_switchChatGPTProvider',
      data: {
        provider: provider,
      },
    })
  }
  return {
    provider: appSettings.chatGPTProvider,
    updateChatGPTProvider,
  }
}
export default useChatGPTProvider
