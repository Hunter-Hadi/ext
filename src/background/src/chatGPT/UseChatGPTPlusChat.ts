import { ChatStatus } from '@/background/provider/chat'
import Log from '@/utils/Log'
import Browser from 'webextension-polyfill'
import {
  APP_USE_CHAT_GPT_HOST,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
} from '@/types'
import {
  backgroundSendAllClientMessage,
  createBackgroundMessageListener,
  setChromeExtensionSettings,
} from '@/background/utils'
import { getCacheConversationId } from '@/background/src/chatGPT/util'

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
          case 'Client_updateUserInfo':
            {
              const { accessToken, refreshToken, userInfo } = data
              log.info(
                'Client_updateUserInfo',
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
          default:
            break
        }
      }
      return undefined
    })
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
    },
    onMessage?: (message: {
      type: 'error' | 'message' | 'done'
      data: {
        text: string
        error: string
        conversationId: string
      }
    }) => void,
  ) {
    const cacheConversationId = await getCacheConversationId()
    const { include_history = false, taskId } = options || {}
    const postBody = Object.assign(
      {
        include_history,
        message_content: question,
      },
      cacheConversationId ? { conversation_id: cacheConversationId } : {},
    )
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    fetch(`https://dev.usechatgpt.ai/gpt/get_chatgpt_response`, {
      signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(postBody),
    })
      .then(async (result) => {
        const body = await result.json()
        const { status, text, conversation_id: conversationId } = body
        if (status === 'OK') {
          if (conversationId && typeof conversationId === 'string') {
            await setChromeExtensionSettings({
              conversationId,
            })
          }
          onMessage &&
            onMessage({
              type: 'message',
              data: {
                text,
                error: '',
                conversationId: cacheConversationId as string,
              },
            })
        } else {
          log.error('askChatGPT error: \t', body)
          onMessage &&
            onMessage({
              type: 'error',
              data: {
                text: '',
                error: 'Network error',
                conversationId: cacheConversationId as string,
              },
            })
        }
        return undefined
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          log.info('abort')
          onMessage &&
            onMessage({
              type: 'error',
              data: {
                text: '',
                error: 'manual aborted request.',
                conversationId: cacheConversationId as string,
              },
            })
        } else {
          log.error('askChatGPT error: \t', error)
          onMessage &&
            onMessage({
              type: 'error',
              data: {
                text: '',
                error: 'Network error',
                conversationId: cacheConversationId as string,
              },
            })
        }
      })
    // TODO: ask chatgpt
    // const controller = new AbortController()
    // const result = await fetchSSE(`https://dev.usechatgpt.ai/gpt/get_chatgpt_response`, {
    //   method: 'POST',
    //   signal: controller.signal,
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${this.token}`,
    //   },
    //   body: JSON.stringify(
    //     Object.assign({
    //       message_content: 'give me a long story',
    //     }),
    //   ),
    //   onMessage: (message: string) => {
    //     log.info(message)
    //   },
    // })
    //   .then()
    //   .catch((err) => {
    //     log.error(err)
    //   })
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
        ?.refreshToken
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
