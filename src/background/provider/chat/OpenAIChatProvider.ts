import { OpenAIChat } from '@/background/src/openai'
import { ChatAdapterInterface } from '@/background/provider/chat/ChatAdapter'

class OpenAIChatProvider implements ChatAdapterInterface {
  private openAIChat: OpenAIChat
  constructor(openAIChat: OpenAIChat) {
    this.openAIChat = openAIChat
  }
  auth() {
    return this.openAIChat.auth()
  }
  sendQuestion(question: string) {
    return this.openAIChat.sendMessage(question)
  }
  destroy() {
    return this.openAIChat.destroy()
  }
  get status() {
    return this.openAIChat.status
  }
}
export { OpenAIChatProvider }
