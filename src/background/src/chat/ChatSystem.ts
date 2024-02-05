import Browser from 'webextension-polyfill'

import {
  ChatAdapter,
  ChatAdapterInterface,
  ChatStatus,
  ChatSystemInterface,
  IAIProviderType,
} from '@/background/provider/chat'
import { IChatGPTAskQuestionFunctionType } from '@/background/provider/chat/ChatAdapter'
import { updateRemoteAIProviderConfigAsync } from '@/background/src/chat/OpenAIChat/utils'
import {
  getAIProviderSettings,
  processAskAIParameters,
  setAIProviderSettings,
} from '@/background/src/chat/util'
import ConversationManager, {
  IChatConversation,
} from '@/background/src/chatConversations'
import {
  backgroundSendAllClientMessage,
  createBackgroundMessageListener,
} from '@/background/utils'
import {
  getChromeExtensionLocalStorage,
  setChromeExtensionLocalStorage,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionLocalStorage'
import { APP_VERSION } from '@/constants'
import { IChatUploadFile, IUserChatMessage } from '@/features/chatgpt/types'
import { MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL } from '@/features/common/constants'
import Log from '@/utils/Log'

const log = new Log('Background/Chat/ChatSystem')

class ChatSystem implements ChatSystemInterface {
  currentProvider?: IAIProviderType
  private adapters: {
    [key in IAIProviderType]?: ChatAdapterInterface
  } = {}
  constructor() {
    // 获取model的白名单，因为要动态禁用一些model
    this.initChatSystem()
  }
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
  private initChatSystem() {
    createBackgroundMessageListener(async (runtime, event, data, sender) => {
      if (runtime === 'client') {
        switch (event) {
          case 'Client_switchAIProvider': {
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
          case 'Client_AuthAIProvider': {
            const { provider } = data
            const needAuthAIProvider = this.adapters[
              provider as IAIProviderType
            ]
            await needAuthAIProvider?.auth(sender.tab?.id || 0)
            console.log(
              'Client_AuthAIProvider',
              needAuthAIProvider?.status,
              needAuthAIProvider,
            )
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
            const initConversationData = (data.initConversationData ||
              {}) as IChatConversation
            console.log('新版Conversation 创建会话', initConversationData)
            if (
              initConversationData.meta.AIProvider &&
              this.currentProvider !== initConversationData.meta.AIProvider
            ) {
              await this.switchAdapter(initConversationData.meta.AIProvider)
            }
            const conversationId = await this.createConversation(
              initConversationData || {},
            )
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
          case 'Client_changeConversation': {
            const { conversationId } = data
            if (conversationId) {
              const conversation = await ConversationManager.conversationDB.getConversationById(
                conversationId,
              )
              if (conversation) {
                await this.switchAdapterWithConversation(conversation)
                return {
                  success: true,
                  data: {
                    conversationId,
                  },
                }
              }
            }
            return {
              success: false,
              data: {},
              message: '',
            }
          }
          case 'Client_askChatGPTQuestion':
            {
              // 每次提问的时候尝试更新一下model的白名单
              updateRemoteAIProviderConfigAsync().then().catch()
              const taskId = data.taskId
              const question = data.question as IUserChatMessage
              console.log('新版Conversation 提问', question)
              if (question.conversationId) {
                const conversation = await ConversationManager.conversationDB.getConversationById(
                  question.conversationId,
                )
                if (conversation) {
                  // 如果会话存在，但是AIProvider不一致，需要切换AIProvider
                  if (
                    conversation?.meta?.AIProvider &&
                    conversation.meta.AIProvider !== this.currentProvider
                  ) {
                    await this.switchAdapterWithConversation(conversation)
                  } else if (conversation.id) {
                    // 更新AI provider的当前使用的会话
                    await this.currentAdapter?.createConversation(conversation)
                  }
                  // 处理AIProvider的参数
                  await processAskAIParameters(conversation, question)
                  // 处理attachments
                  if (this.currentAdapter) {
                    if (
                      this.currentAdapter.chatFiles.length === 0 &&
                      question.meta?.regenerate &&
                      question.meta.attachments?.length
                    ) {
                      await this.currentAdapter.clearFiles()
                      await this.currentAdapter.updateFiles(
                        question.meta.attachments,
                      )
                    }
                  }
                  // 更新客户端的聊天记录
                  await this.updateClientConversationMessages(conversation.id)
                }
              }
              await this.sendQuestion(taskId, sender, question)
              this.updateClientFiles()
            }
            break
          case 'Client_removeChatGPTConversation': {
            const { conversationId, isForceRemove = false } = data
            if (isForceRemove && conversationId) {
              const success = await ConversationManager.softDeleteConversation(
                conversationId,
              )
              return {
                success,
                data: {},
                message: '',
              }
            }
            console.log('新版Conversation 删除会话', conversationId)
            const success = await this.removeConversation(conversationId || '')
            await this.updateClientConversationMessages(conversationId)
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
          case 'Client_chatUploadFiles':
            {
              const { files } = data
              await this.uploadFiles(files)
              this.updateClientFiles()
              return {
                success: true,
                data: this.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatAbortUploadFiles':
            {
              const { files } = data
              const success = await this.abortUploadFiles(
                files.map((file: IChatUploadFile) => file.id),
              )
              this.updateClientFiles()
              return {
                success,
                data: this.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatRemoveFiles':
            {
              const { files } = data
              const success = await this.removeFiles(
                files.map((file: IChatUploadFile) => file.id),
              )
              this.updateClientFiles()
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
              this.updateClientFiles()
              return {
                success,
                data: this.chatFiles,
                message: '',
              }
            }
            break
          case 'Client_chatUploadFilesChange':
            {
              const { files } = data
              await this.updateFiles(files)
              await this.updateClientFiles()
              return {
                success: true,
                data: {},
                message: 'ok',
              }
            }
            break
          case 'Client_chatGetUploadFileToken': {
            const token = await this.getUploadFileToken()
            return {
              success: true,
              data: token,
              message: 'ok',
            }
          }
          default:
            break
        }
      }
      return undefined
    })
    getChromeExtensionLocalStorage().then(async (settings) => {
      if (settings.sidebarSettings?.common?.currentAIProvider) {
        console.log(
          'settings.currentAIProvider',
          settings.sidebarSettings.common?.currentAIProvider,
        )
        await this.switchAdapter(
          settings.sidebarSettings.common?.currentAIProvider,
        )
      }
    })
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
  async switchAdapterWithConversation(
    conversation: IChatConversation,
    needUpdateClientMessages = true,
  ) {
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
      if (needUpdateClientMessages) {
        // 更新客户端的聊天记录
        await this.updateClientConversationMessages(conversation.id)
      }
    }
  }
}
export { ChatSystem }
