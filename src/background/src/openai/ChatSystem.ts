import {
  ChatAdapter,
  ChatAdapterInterface,
  ChatInterface,
  ChatStatus,
  IChatGPTProviderType,
} from '@/background/provider/chat'
import { createBackgroundMessageListener } from '@/background/utils'
import Log from '@/utils/Log'

const log = new Log('ChatSystem')

class ChatSystem implements ChatInterface {
  private adapters: {
    [key in IChatGPTProviderType]?: ChatAdapterInterface
  } = {}
  private currentAdapter?: ChatAdapterInterface
  constructor() {
    this.initChatSystem()
  }
  private initChatSystem() {
    createBackgroundMessageListener(async (runtime, event, data, sender) => {
      if (runtime === 'client') {
        log.info('message', runtime, event, data)
        switch (event) {
          case 'Client_authChatService':
            {
              const { provider } = data
              if (this.currentAdapter) {
                await this.currentAdapter.destroy()
              }
              this.switchAdapter(provider)
              await this.currentAdapter?.auth()
              debugger
              return {
                success: true,
                data: {
                  provider,
                },
                message: '',
              }
            }
            break
          default:
            break
        }
      }
      return undefined
    })
  }
  addAdapter(provider: IChatGPTProviderType, adapter: ChatAdapter): void {
    this.adapters[provider] = adapter
  }
  switchAdapter(
    provider: IChatGPTProviderType,
  ): ChatAdapterInterface | undefined {
    this.currentAdapter = this.adapters[provider]
    return this.currentAdapter
  }
  async auth() {
    if (this.currentAdapter) {
      await this.currentAdapter.auth()
    }
  }
  sendQuestion(question: string): Promise<void> {
    return this.currentAdapter?.sendQuestion(question) || Promise.resolve()
  }
  async destroy() {
    await this.currentAdapter?.destroy()
  }
  get status(): ChatStatus {
    return this.currentAdapter?.status || 'needAuth'
  }
}
export { ChatSystem }
