import { ChatStatus } from '@/background/provider/chat'
import Log from '@/utils/Log'
import Browser from 'webextension-polyfill'
import {
  APP_USE_CHAT_GPT_API_HOST,
  APP_USE_CHAT_GPT_HOST,
  CHAT_GPT_PROVIDER,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
} from '@/types'
import {
  backgroundSendAllClientMessage,
  createBackgroundMessageListener,
} from '@/background/utils'
import { getCacheConversationId } from '@/background/src/chatGPT/util'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { backgroundFetchUseChatGPTUserInfo } from '@/background/src/usechatgpt'

const log = new Log('Background/ChatGPT/UseChatGPTPlusChat')

class UseChatGPTPlusChat {
  status: ChatStatus = 'needAuth'
  private active = false
  private lastActiveTabId?: number
  private token?: string
  private taskList: {
    [key in string]: any
  } = {}
  constructor() {
    this.init()
  }
  private init() {
    log.info('init')
    createBackgroundMessageListener(async (runtime, event, data, sender) => {
      if (runtime === 'client') {
        switch (event) {
          case 'Client_updateUseChatGPTAuthInfo':
            {
              const { accessToken, refreshToken, userInfo } = data
              log.info(
                'Client_updateUseChatGPTAuthInfo',
                accessToken,
                refreshToken,
                userInfo,
              )
              if (accessToken && refreshToken) {
                await Browser.storage.local.set({
                  [CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]: {
                    accessToken,
                    refreshToken,
                    userInfo,
                  },
                })
              } else {
                await Browser.storage.local.remove(
                  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
                )
              }
              await this.checkTokenAndUpdateStatus(sender.tab?.id)
            }
            break
          case 'Client_getUseChatGPTUserInfo':
            {
              const userInfo = await this.getUserInfo()
              return {
                success: true,
                data: userInfo,
                message: 'ok',
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
  async preAuth() {
    this.active = true
    await this.checkTokenAndUpdateStatus()
  }
  async auth(authTabId: number) {
    this.active = true
    this.lastActiveTabId = authTabId
    await this.checkTokenAndUpdateStatus()
    if (this.status === 'needAuth') {
      // 引导去登陆
      await Browser.tabs.create({
        active: true,
        url: APP_USE_CHAT_GPT_HOST,
      })
    }
    await this.updateClientStatus()
  }
  private async checkTokenAndUpdateStatus(authTabId?: number) {
    const prevStatus = this.status
    this.token = await this.getToken()
    this.status = this.token ? 'success' : 'needAuth'
    if (prevStatus !== this.status) {
      await this.updateClientStatus()
      if (this.lastActiveTabId) {
        await Browser.tabs.update(this.lastActiveTabId, {
          active: true,
        })
        this.lastActiveTabId = undefined
        if (authTabId) {
          await Browser.tabs.remove(authTabId)
        }
      }
    }
  }

  /**
   * 获取回答
   * @param question 问题
   * @param options
   * @param onMessage 回调
   * @param options.include_history 是否包含历史记录
   * @param options.taskId 任务id
   */
  async askChatGPT(
    question: string,
    options?: {
      taskId: string
      include_history?: boolean
      regenerate?: boolean
      streaming?: boolean
    },
    onMessage?: (message: {
      type: 'error' | 'message'
      done: boolean
      error: string
      data: {
        text: string
        conversationId: string
      }
    }) => void,
  ) {
    const cacheConversationId = await getCacheConversationId()
    const {
      include_history = false,
      taskId,
      streaming = true,
      regenerate = false,
    } = options || {}
    const postBody = Object.assign(
      {
        include_history,
        regenerate,
        streaming,
        message_content: question,
      },
      cacheConversationId ? { conversation_id: cacheConversationId } : {},
    )
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    log.info('streaming start', postBody)
    let messageResult = ''
    await fetchSSE(`${APP_USE_CHAT_GPT_API_HOST}/gpt/get_chatgpt_response`, {
      provider: CHAT_GPT_PROVIDER.USE_CHAT_GPT_PLUS,
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(postBody),
      onMessage: (message: string) => {
        log.debug('streaming message', message)
        if (message) {
          messageResult += message
        }
        onMessage &&
          onMessage({
            type: 'message',
            done: false,
            error: '',
            data: { text: messageResult, conversationId: cacheConversationId },
          })
      },
    })
      .then((res) => {
        log.info('streaming end success', res)
        onMessage &&
          onMessage({
            type: 'message',
            done: true,
            error: '',
            data: { text: '', conversationId: cacheConversationId },
          })
      })
      .catch((err) => {
        const error = JSON.parse(err.message || err)
        log.info('streaming end error', error)
        try {
          if (error?.message === 'The user aborted a request.') {
            onMessage &&
              onMessage({
                type: 'error',
                error: 'manual aborted request.',
                done: true,
                data: { text: '', conversationId: cacheConversationId },
              })
            return
          }
          if (error?.detail === 'Your premium plan has expired') {
            onMessage &&
              onMessage({
                type: 'error',
                error: `Your premium plan has expired. [Get free quota](${
                  APP_USE_CHAT_GPT_HOST + '/account/referral'
                })`,
                done: true,
                data: { text: '', conversationId: cacheConversationId },
              })
            return
          }
          log.error('sse error', err)
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error: error.message || error.detail || 'Network error.',
              data: { text: '', conversationId: cacheConversationId },
            })
        } catch (e) {
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error: 'Network error.',
              data: { text: '', conversationId: cacheConversationId },
            })
        }
      })
  }
  async getUserInfo() {
    const token = await this.getToken()
    if (!token) {
      return undefined
    }
    return await backgroundFetchUseChatGPTUserInfo(token)
  }
  async abortTask(taskId: string) {
    if (this.taskList[taskId]) {
      this.taskList[taskId]()
      delete this.taskList[taskId]
      return true
    }
    return true
  }
  async destroy() {
    log.info('destroy')
    this.status = 'needAuth'
    await this.updateClientStatus()
    this.active = false
  }
  private async getToken() {
    const cache = await Browser.storage.local.get(
      CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
    )
    if (cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]) {
      // 应该用accessToken
      return cache[CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY]
        ?.refreshToken as string
    }
    return ''
  }
  async updateClientStatus() {
    if (this.active) {
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
      })
    }
  }
}
export { UseChatGPTPlusChat }
