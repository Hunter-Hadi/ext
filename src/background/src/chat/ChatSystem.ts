import {
  ChatAdapter,
  ChatAdapterInterface,
  ChatSystemInterface,
  ChatStatus,
  IAIProviderType,
} from '@/background/provider/chat'
import {
  backgroundSendAllClientMessage,
  createBackgroundMessageListener,
  getChromeExtensionOnBoardingData,
  getChromeExtensionSettings,
  setChromeExtensionOnBoardingData,
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
import {
  IChatUploadFile,
  IUserChatMessageExtraType,
} from '@/features/chatgpt/types'
import { OnBoardingKeyType } from '@/background/utils/onboardingStorage'
import ChatConversations from '@/background/src/chatConversations'
import { v4 as uuidV4 } from 'uuid'

const log = new Log('Background/Chat/ChatSystem')

class ChatSystem implements ChatSystemInterface {
  currentProvider?: IAIProviderType
  private adapters: {
    [key in IAIProviderType]?: ChatAdapterInterface
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
            await setChromeExtensionSettings({
              conversationId,
            })
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
              const { regenerate, retry } = options as IUserChatMessageExtraType
              // 如果是重试或者重新生成，需要从原始会话中获取问题
              const conversationId = question.conversationId
              if ((retry || regenerate) && conversationId) {
                const originalConversation =
                  await ChatConversations.conversationDB.getConversationById(
                    conversationId,
                  )
                if (originalConversation) {
                  const originalMessages = originalConversation.messages
                  if (regenerate) {
                    // 重新生成，需要删除原始会话中的问题
                    const originalMessageIndex = originalMessages.findIndex(
                      (message) => message.messageId === question.messageId,
                    )
                    const originalMessage =
                      originalMessages[originalMessageIndex]
                    const needDeleteCount =
                      originalMessages.length - 1 - originalMessageIndex
                    await ChatConversations.deleteMessages(
                      conversationId,
                      needDeleteCount,
                    )
                    // 重新生成问题
                    if (originalMessage) {
                      question.question = originalMessage.text
                      question.messageId = originalMessage.messageId
                      question.parentMessageId = originalMessage.parentMessageId
                    }
                  } else if (retry) {
                    // 重试，到这一步sidebar里面有[问题，答案，新问题]，要删到[问题]
                    const originalMessageIndex = originalMessages.findIndex(
                      (message) =>
                        message.messageId === question.parentMessageId,
                    )
                    // 所以这里还要-1
                    const originalMessage =
                      originalMessages[originalMessageIndex]
                    const needDeleteCount = Math.max(
                      originalMessages.length - originalMessageIndex - 1,
                      0,
                    )
                    await ChatConversations.deleteMessages(
                      conversationId,
                      needDeleteCount,
                    )
                    // 重新生成问题
                    if (originalMessage) {
                      question.question = originalMessage.text
                      question.messageId = uuidV4()
                      question.parentMessageId = originalMessage.parentMessageId
                    }
                  }
                  await this.updateClientConversationMessages(conversationId)
                }
              }
              await this.sendQuestion(taskId, sender, question, options)
              this.updateClientFiles()
            }
            break
          case 'Client_removeChatGPTConversation': {
            const { conversationId } = data
            const success = await this.removeConversation(conversationId || '')
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
    getChromeExtensionSettings().then(async (settings) => {
      if (settings.chatGPTProvider) {
        console.log('settings.chatGPTProvider', settings.chatGPTProvider)
        await this.switchAdapter(settings.chatGPTProvider)
      }
    })
  }
  addAdapter(provider: IAIProviderType, adapter: ChatAdapter): void {
    this.adapters[provider] = adapter
  }
  async switchAdapter(provider: IAIProviderType) {
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
      const onBoardingData = await getChromeExtensionOnBoardingData()
      const onBoardingDataKey = `ON_BOARDING_RECORD_AI_PROVIDER_HAS_AUTH_${this.currentProvider}`
      // 如果onBoardingData里面有这个key, 才保存
      if (
        Object.prototype.hasOwnProperty.call(onBoardingData, onBoardingDataKey)
      ) {
        await setChromeExtensionOnBoardingData(
          onBoardingDataKey as OnBoardingKeyType,
          true,
        )
      }
    }
  }
  async preAuth() {
    if (this.currentAdapter) {
      // 判断是否auth过，如果从来没有auth过，就不需要preAuth
      const onBoardingData = await getChromeExtensionOnBoardingData()
      const onBoardingDataKey = `ON_BOARDING_RECORD_AI_PROVIDER_HAS_AUTH_${this.currentProvider}`
      // 如果onBoardingData里面有这个key, 并且为true, 才执行preAuth
      if (
        Object.prototype.hasOwnProperty.call(onBoardingData, onBoardingDataKey)
      ) {
        if (onBoardingData[onBoardingDataKey as OnBoardingKeyType]) {
          await this.currentAdapter.preAuth()
        } else {
          // 说明没有onBoarding过
          await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
            status: 'needAuth',
          })
        }
      } else {
        // 如果onBoardingData里面没有这个key, 按理说不可能没有, 但是为了保险起见, 正常执行preAuth
        await this.currentAdapter.preAuth()
      }
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
    const conversation = await ChatConversations.getClientConversation(
      conversationId,
    )
    backgroundSendAllClientMessage('Client_listenUpdateConversationMessages', {
      conversation,
    })
  }
}
export { ChatSystem }
