import { ChatAdapterInterface } from '@/background/provider/chat/ChatProvider'
import { UseChatGPTPlusChat } from '@/background/src/openai'

class UseChatGPTPlusChatProvider implements ChatAdapterInterface {
  private useChatGPTPlusChat: UseChatGPTPlusChat

  constructor(useChatGPTPlusChat: UseChatGPTPlusChat) {
    this.useChatGPTPlusChat = useChatGPTPlusChat
  }
  async auth(): Promise<void> {
    await this.useChatGPTPlusChat.auth()
  }
}
export { UseChatGPTPlusChatProvider }
