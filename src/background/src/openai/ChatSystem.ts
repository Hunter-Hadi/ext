import {
  ChatAdapter,
  ChatAdapterInterface,
  ChatInterface,
  ChatStatus,
  IChatGPTProviderType,
} from '@/background/provider/chat'
import {
  createBackgroundMessageListener,
  getChromeExtensionSettings,
  setChromeExtensionSettings,
} from '@/background/utils'
import Log from '@/utils/Log'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'

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
          case 'Client_switchChatGPTProvider':
            {
              const { provider } = data
              await this.switchAdapter(provider)
              return {
                success: true,
                data: {
                  provider,
                },
                message: '',
              }
            }
            break
          case 'Client_authChatGPTProvider': {
            await this.auth(sender.tab?.id || 0)
            return {
              success: true,
              data: {},
              message: '',
            }
          }
          case 'Client_checkChatGPTStatus': {
            return {
              success: true,
              data: {
                status: this.status,
              },
              message: '',
            }
          }
          case 'Client_createChatGPTConversation': {
            const conversationId = await this.createConversation()
            if (conversationId) {
              return {
                success: true,
                data: {
                  conversationId,
                },
                message: '',
              }
            } else {
              return {
                success: false,
                data: {
                  conversationId,
                },
                message: 'create conversation failed',
              }
            }
          }
          case 'Client_askChatGPTQuestion':
            {
              const { taskId, question } = data
              await this.sendQuestion(taskId, sender, question)
            }
            break
          case 'Client_removeChatGPTConversation': {
            const cache = await getChromeExtensionSettings()
            if (cache.conversationId) {
              const success = await this.removeConversation(
                cache.conversationId,
              )
              return {
                success,
                data: {},
                message: '',
              }
            }
            return {
              success: false,
              data: {},
              message: 'no conversationId',
            }
          }
          case 'Client_abortAskChatGPTQuestion': {
            const { messageId } = data
            await this.abortAskQuestion(messageId)
            return {
              success: true,
              data: {},
              message: '',
            }
          }
          default:
            break
        }
      }
      return undefined
    })
    getChromeExtensionSettings().then(async (settings) => {
      if (settings.chatGPTProvider) {
        await this.switchAdapter(settings.chatGPTProvider)
      }
    })
  }
  addAdapter(provider: IChatGPTProviderType, adapter: ChatAdapter): void {
    this.adapters[provider] = adapter
  }
  async switchAdapter(provider: IChatGPTProviderType) {
    // if (this.currentAdapter) {
    //   await this.currentAdapter.destroy()
    // }
    await setChromeExtensionSettings({
      chatGPTProvider: provider,
    })
    this.currentAdapter = this.adapters[provider]
    return this.currentAdapter
  }
  async auth(authTabId: number) {
    if (this.currentAdapter) {
      await this.currentAdapter.auth(authTabId)
    }
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = (taskId, sender, data) => {
    return (
      this.currentAdapter?.sendQuestion(taskId, sender, data) ||
      Promise.resolve()
    )
  }
  async abortAskQuestion(messageId: string) {
    if (this.currentAdapter) {
      return await this.currentAdapter.abortAskQuestion(messageId)
    }
    return false
  }
  async createConversation() {
    if (!this.currentAdapter) {
      return ''
    }
    return (await this.currentAdapter?.createConversation()) || ''
  }
  async removeConversation(conversationId: string) {
    if (!this.currentAdapter) {
      return false
    }
    const result = await this.currentAdapter?.removeConversation(conversationId)
    return result
  }
  async destroy() {
    await this.currentAdapter?.destroy()
  }
  get status(): ChatStatus {
    if (this.currentAdapter) {
      return this.currentAdapter.status
    }
    return 'switchProvider'
  }
}
export { ChatSystem }
