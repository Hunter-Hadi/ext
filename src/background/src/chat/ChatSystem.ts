import {
  ChatAdapter,
  ChatAdapterInterface,
  ChatSystemInterface,
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
import Browser from 'webextension-polyfill'
import {
  APP_VERSION,
  CHAT_GPT_MESSAGES_RECOIL_KEY,
  CHROME_EXTENSION_HOMEPAGE_URL,
} from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'

const log = new Log('Background/Chat/ChatSystem')

class ChatSystem implements ChatSystemInterface {
  currentProvider?: IChatGPTProviderType
  private adapters: {
    [key in IChatGPTProviderType]?: ChatAdapterInterface
  } = {}
  constructor() {
    this.initChatSystem()
  }
  get status(): ChatStatus {
    if (this.currentAdapter) {
      return this.currentAdapter.status
    }
    return 'needAuth'
  }
  get currentAdapter(): ChatAdapterInterface | undefined {
    return this.currentProvider
      ? this.adapters[this.currentProvider]
      : undefined
  }
  get chatFiles() {
    return this.currentAdapter?.chatFiles || []
  }
  private initChatSystem() {
    createBackgroundMessageListener(async (runtime, event, data, sender) => {
      if (runtime === 'client') {
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
            const { provider } = data
            await this.switchAdapter(provider)
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
              const { taskId, question, options } = data
              await this.sendQuestion(taskId, sender, question, options)
            }
            break
          case 'Client_removeChatGPTConversation': {
            const cache = await getChromeExtensionSettings()
            const success = await this.removeConversation(
              cache.conversationId || '',
            )
            return {
              success,
              data: {},
              message: '',
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
          case 'Client_destroyWithLogout': {
            await this.destroy()
            return {
              success: true,
              data: {},
              message: '',
            }
          }
          case 'Client_chatGetFiles':
            {
              return {
                success: true,
                data: this.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatUploadFile':
            {
              const { file } = data
              await this.uploadFile(file)
              return {
                success: true,
                data: this.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatAbortUploadFile':
            {
              const { file } = data
              const success = await this.abortUploadFile(file.id)
              return {
                success,
                data: this.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatRemoveFile':
            {
              const { file } = data
              const success = await this.removeFile(file.id)
              return {
                success,
                data: this.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatClearFiles':
            {
              const success = await this.clearFiles()
              return {
                success,
                data: this.chatFiles,
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
    getChromeExtensionSettings().then(async (settings) => {
      if (settings.chatGPTProvider) {
        console.log('settings.chatGPTProvider', settings.chatGPTProvider)
        await this.switchAdapter(settings.chatGPTProvider)
      }
    })
  }
  addAdapter(provider: IChatGPTProviderType, adapter: ChatAdapter): void {
    this.adapters[provider] = adapter
  }
  async switchAdapter(provider: IChatGPTProviderType) {
    if (provider === this.currentProvider) {
      log.info('switchAdapter', 'same provider no need to switch')
      return
    }
    // destroy old adapter
    if (this.currentAdapter) {
      await this.currentAdapter.destroy()
    }
    this.currentProvider = provider
    await setChromeExtensionSettings({
      chatGPTProvider: provider,
    })
    await this.preAuth()
    try {
      Browser.runtime.setUninstallURL(
        `${CHROME_EXTENSION_HOMEPAGE_URL}/survey/uninstall?version=${APP_VERSION}&provider=${provider}`,
      )
    } catch (e) {
      log.error('switchAdapter', 'setUninstallURL', e)
    }
    return this.currentAdapter
  }
  async auth(authTabId: number) {
    if (this.currentAdapter) {
      await this.currentAdapter.auth(authTabId)
    }
  }
  async preAuth() {
    if (this.currentAdapter) {
      await this.currentAdapter.preAuth()
    }
  }
  sendQuestion: IChatGPTAskQuestionFunctionType = (
    taskId,
    sender,
    data,
    options,
  ) => {
    return (
      this.currentAdapter?.sendQuestion(taskId, sender, data, options) ||
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
    // 清空本地储存的message
    await Browser.storage.local.set({
      [CHAT_GPT_MESSAGES_RECOIL_KEY]: JSON.stringify([]),
    })
    // 清空本地储存的conversationId
    await setChromeExtensionSettings({
      conversationId: '',
    })
    await this.currentAdapter?.destroy()
    await this.currentAdapter?.clearFiles()
  }
  async uploadFile(file: IChatUploadFile) {
    if (!this.currentAdapter) {
      return undefined
    }
    return await this.currentAdapter.uploadFile(file)
  }
  async abortUploadFile(fileId: string) {
    if (!this.currentAdapter) {
      return false
    }
    return await this.currentAdapter.abortUploadFile(fileId)
  }
  async removeFile(fileId: string) {
    if (!this.currentAdapter) {
      return false
    }
    return await this.currentAdapter.removeFile(fileId)
  }
  async getFiles() {
    return this.chatFiles
  }
  async clearFiles() {
    if (!this.currentAdapter) {
      return false
    }
    return await this.currentAdapter.clearFiles()
  }
}
export { ChatSystem }
