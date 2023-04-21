import { ChatStatus } from '@/background/provider/chat'
import Log from '@/utils/Log'
import Browser from 'webextension-polyfill'
import {
  APP_USE_CHAT_GPT_API_HOST,
  APP_USE_CHAT_GPT_HOST,
  CHAT_GPT_PROVIDER,
  CHROME_EXTENSION_LOCAL_STORAGE_APP_USECHATGPTAI_SAVE_KEY,
  BACKGROUND_SEND_TEXT_SPEED_SETTINGS,
} from '@/types'
import {
  backgroundSendAllClientMessage,
  chromeExtensionLogout,
  createBackgroundMessageListener,
  createChromeExtensionOptionsPage,
} from '@/background/utils'
import { getCacheConversationId } from '@/background/src/chat/util'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { backgroundFetchUseChatGPTUserInfo } from '@/background/src/usechatgpt'

const log = new Log('Background/Chat/UseChatGPTPlusChat')

class UseChatGPTPlusChat {
  status: ChatStatus = 'needAuth'
  private active = false
  private lastActiveTabId?: number
  private token?: string
  private oncePreCheck = true
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
              const preToken = await this.getToken()
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
                await chromeExtensionLogout()
                this.oncePreCheck = true
              }
              await this.checkTokenAndUpdateStatus(sender.tab?.id)
              if (!preToken && accessToken) {
                await createChromeExtensionOptionsPage('', false)
              }
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
    this.oncePreCheck = false
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
      log.info('checkTokenAndUpdateStatus', this.status, this.lastActiveTabId)
      // 本来要切回去chat页面,流程改了，不需要这个变量来切换了
      this.lastActiveTabId = undefined
      if (authTabId) {
        // 因为会打开新的optionsTab，所以需要再切换回去
        await Browser.tabs.update(authTabId, {
          active: true,
        })
      }
    }
    if (this.status === 'success' && this.oncePreCheck) {
      this.status = 'needAuth'
    }
    await this.updateClientStatus()
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
    // 后端会每段每段的给前端返回数据
    // 前端保持匀速输出内容
    let messageResult = ''
    let isEnd = false
    let hasError = false
    let sentTextLength = 0
    let conversationId = cacheConversationId
    const sendTextSettings = await Browser.storage.local.get(
      BACKGROUND_SEND_TEXT_SPEED_SETTINGS,
    )
    const settings = sendTextSettings[BACKGROUND_SEND_TEXT_SPEED_SETTINGS] || {}
    const interval = settings.interval || 50 //每隔(interval)ms输出一次
    const echoTextRate = settings.rate || 0.5 // 每秒输出待发送文本的(rate * 100)%
    const delay = (t: number) =>
      new Promise((resolve) => setTimeout(resolve, t))
    const throttleEchoText = async () => {
      if (hasError) {
        return
      }
      if (isEnd && sentTextLength === messageResult.length) {
        // 在没有错误的情况下真正结束发送文本
        log.info('streaming end success')
        onMessage &&
          onMessage({
            done: true,
            type: 'message',
            error: '',
            data: { text: '', conversationId },
          })
        return
      }
      let currentSendTextTextLength = 0
      // 剩余要发送的文本长度
      const waitSendTextLength = Math.floor(
        messageResult.length - sentTextLength,
      )
      // 如果没有结束的话
      if (!isEnd) {
        // 发送剩余未文本的30%
        const needSendTextLength = Math.floor(waitSendTextLength * echoTextRate)
        currentSendTextTextLength = messageResult.slice(
          sentTextLength,
          needSendTextLength + sentTextLength,
        ).length
      } else {
        // 如果结束了的话, 1秒钟发完剩下的文本, 至少发送10个字符
        const needSendTextLength = Math.max(
          Math.floor(messageResult.length * 0.1),
          10,
        )
        currentSendTextTextLength = messageResult.slice(
          sentTextLength,
          needSendTextLength + sentTextLength,
        ).length
      }
      if (currentSendTextTextLength > 0) {
        log.debug(
          'streaming echo message',
          isEnd
            ? '一秒发送完剩下的文本'
            : `每${interval}毫秒发送剩余文本的${(echoTextRate * 100).toFixed(
                0,
              )}%`,
          sentTextLength,
          currentSendTextTextLength,
          messageResult.length,
        )
        sentTextLength += currentSendTextTextLength
        onMessage &&
          onMessage({
            type: 'message',
            done: false,
            error: '',
            data: {
              text: messageResult.slice(0, sentTextLength),
              conversationId: conversationId,
            },
          })
      }
      await delay(isEnd ? 100 : interval)
      await throttleEchoText()
    }
    throttleEchoText()
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
        try {
          const messageData = JSON.parse(message as string)
          log.debug('streaming on message')
          if (messageData?.conversation_id) {
            conversationId = messageData.conversation_id
          }
          if (messageData?.text) {
            // 记录到结果里，前端分流输出
            messageResult += messageData.text
          }
        } catch (e) {
          log.error('parse message.data error: \t', e)
        }
      },
    })
      .then()
      .catch((err) => {
        log.info('streaming end error', err)
        isEnd = true
        hasError = true
        if (err?.message === 'The user aborted a request.') {
          onMessage &&
            onMessage({
              type: 'error',
              error: 'manual aborted request.',
              done: true,
              data: { text: '', conversationId },
            })
          return
        }
        try {
          const error = JSON.parse(err.message || err)
          if (error?.detail === 'Your premium plan has expired') {
            onMessage &&
              onMessage({
                type: 'error',
                error: `Your premium plan has expired. [Get free quota](${
                  APP_USE_CHAT_GPT_HOST + '/referral'
                })`,
                done: true,
                data: { text: '', conversationId },
              })
            return
          }
          log.error('sse error', err)
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error: error.message || error.detail || 'Network error.',
              data: { text: '', conversationId },
            })
        } catch (e) {
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error: 'Network error.',
              data: { text: '', conversationId },
            })
        }
      })
    if (!isEnd) {
      log.info('streaming end success')
      isEnd = true
    }
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
