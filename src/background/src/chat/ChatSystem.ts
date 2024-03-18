import Browser from 'webextension-polyfill'

import {
  ChatAdapter,
  ChatAdapterInterface,
  ChatStatus,
  ChatSystemInterface,
  IAIProviderType,
} from '@/background/provider/chat'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'
import {
  getAIProviderSettings,
  setAIProviderSettings,
} from '@/background/src/chat/util'
import ConversationManager, {
  IChatConversation,
} from '@/background/src/chatConversations'
import { backgroundSendAllClientMessage } from '@/background/utils'
import { setChromeExtensionLocalStorage } from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { APP_VERSION } from '@/constants'
import { IChatUploadFile } from '@/features/chatgpt/types'
import { MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL } from '@/features/common/constants'
import Log from '@/utils/Log'

const log = new Log('Background/Chat/ChatSystem')

class ChatSystem implements ChatSystemInterface {
  currentProvider?: IAIProviderType
  adapters: {
    [key in IAIProviderType]?: ChatAdapterInterface
  } = {}
  constructor() {}
  get conversation() {
    return this.currentAdapter?.conversation
  }
  get status(): ChatStatus {
    if (this.currentAdapter) {
      if (this.currentAdapter.status === 'needAuth') {
        // do nothing
      }
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
  addAdapter(provider: IAIProviderType, adapter: ChatAdapter): void {
    this.adapters[provider] = adapter
  }
  async switchAdapter(provider: IAIProviderType) {
    this.currentProvider = provider
    await setChromeExtensionLocalStorage((settings) => {
      if (settings.sidebarSettings?.common) {
        settings.sidebarSettings.common.currentAIProvider = provider
      }
      return settings
    })
    await this.preAuth()
    try {
      Browser.runtime.setUninstallURL(
        `${MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL}/survey/uninstall?version=${APP_VERSION}&provider=${provider}`,
      )
    } catch (e) {
      log.error('switchAdapter', 'setUninstallURL', e)
    }
    await backgroundSendAllClientMessage('Client_updateAppSettings', {
      data: {},
    })
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
    question,
  ) => {
    return (
      this.currentAdapter?.sendQuestion(taskId, sender, question) ||
      Promise.resolve()
    )
  }
  async abortAskQuestion(messageId: string) {
    if (this.currentAdapter) {
      return await this.currentAdapter.abortAskQuestion(messageId)
    }
    return false
  }
  async createConversation(initConversationData: Partial<IChatConversation>) {
    if (!this.currentAdapter) {
      return ''
    }
    return (
      (await this.currentAdapter?.createConversation(initConversationData)) ||
      ''
    )
  }
  async removeConversation(conversationId: string) {
    if (!conversationId) {
      return false
    }
    const conversationDetail = await ConversationManager.getClientConversation(
      conversationId,
    )
    const conversationProvider = conversationDetail?.meta.AIProvider
    if (conversationProvider) {
      const currentProvider = this.adapters[conversationProvider]
      await currentProvider?.createConversation(conversationDetail)
      await currentProvider?.removeConversation(conversationId)
    } else {
      await ConversationManager.softDeleteConversation(conversationId)
    }
    return true
  }
  async destroy() {
    await this.currentAdapter?.removeConversation('')
    await this.currentAdapter?.destroy()
    await this.currentAdapter?.clearFiles()
  }
  async uploadFiles(files: IChatUploadFile[]) {
    if (!this.currentAdapter) {
      return undefined
    }
    return await this.currentAdapter.uploadFiles(files)
  }
  async updateFiles(files: IChatUploadFile[]) {
    if (!this.currentAdapter) {
      return undefined
    }
    return await this.currentAdapter.updateFiles(files)
  }
  async abortUploadFiles(fileIds: string[]) {
    if (!this.currentAdapter) {
      return false
    }
    return await this.currentAdapter.abortUploadFiles(fileIds)
  }
  async removeFiles(fileIds: string[]) {
    if (!this.currentAdapter) {
      return false
    }
    return await this.currentAdapter.removeFiles(fileIds)
  }
  async getFiles() {
    return this.chatFiles
  }
  async getUploadFileToken() {
    if (!this.currentAdapter) {
      return null
    }
    return await this.currentAdapter.getUploadFileToken()
  }
  async clearFiles() {
    if (!this.currentAdapter) {
      return false
    }
    return await this.currentAdapter.clearFiles()
  }
  async updateClientFiles() {
    console.log('Client_chatUploadFilesChange', this.chatFiles)
    backgroundSendAllClientMessage('Client_listenUploadFilesChange', {
      files: this.chatFiles,
    })
  }
  async updateClientConversationMessages(conversationId: string) {
    const conversation = await ConversationManager.getClientConversation(
      conversationId,
    )
    backgroundSendAllClientMessage('Client_listenUpdateConversationMessages', {
      conversation: conversation,
      conversationId,
    })
  }
  async switchAdapterWithConversation(conversation: IChatConversation) {
    const currentConversationAIProvider = conversation.meta.AIProvider
    if (currentConversationAIProvider) {
      console.log('新版Conversation 切换会话: ', conversation?.id, conversation)
      // 更新本地储存AI Provider Settings
      const cache = await getAIProviderSettings(currentConversationAIProvider)
      await setAIProviderSettings(currentConversationAIProvider, {
        ...cache,
        model: conversation.meta.AIModel || cache?.model,
      })
      // 切换AI Provider
      await this.switchAdapter(currentConversationAIProvider)
      // 创建conversation
      await this.currentAdapter?.createConversation(conversation)
      // 更新客户端的聊天记录
      await this.updateClientConversationMessages(conversation.id)
    }
  }
}
export { ChatSystem }
