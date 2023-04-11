import { ChatAdapterInterface } from '@/background/provider/chat/ChatProvider'

class ThirdPartyChat1 {
  private chatHistory: string[] = []
  send(message: string): void {
    console.log(`ThirdPartyChat1: Sending message "${message}"...`)
    this.chatHistory.push(message)
  }
  receive(): string {
    const message = this.chatHistory.shift()
    console.log(`ThirdPartyChat1: Receiving message "${message}"...`)
    return message || ''
  }
  history(): string[] {
    console.log(`ThirdPartyChat1: Retrieving chat history...`)
    return this.chatHistory
  }
}
class ThirdPartyChat1Adapter implements ChatAdapterInterface {
  private thirdPartyChat1: ThirdPartyChat1

  constructor(thirdPartyChat1: ThirdPartyChat1) {
    this.thirdPartyChat1 = thirdPartyChat1
  }

  sendMessage(message: string): void {
    this.thirdPartyChat1.send(message)
  }

  receiveMessage(): string {
    return this.thirdPartyChat1.receive()
  }

  getChatHistory(): string[] {
    return this.thirdPartyChat1.history()
  }
}
