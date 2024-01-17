import Browser from 'webextension-polyfill'

import { ChatStatus } from '@/background/provider/chat'
import BaseChat from '@/background/src/chat/BaseChat'
import {
  IMaxAIChatMessage,
  IMaxAIChatMessageContent,
} from '@/background/src/chat/UseChatGPTChat/types'
import { getThirdProviderSettings } from '@/background/src/chat/util'
import {
  backgroundSendAllClientMessage,
  chromeExtensionLogout,
} from '@/background/utils'
import {
  APP_USE_CHAT_GPT_API_HOST,
  APP_USE_CHAT_GPT_HOST,
  APP_VERSION,
} from '@/constants'
import { MAXAI_IMAGE_GENERATE_MODELS } from '@/features/art/constant'
import { getChromeExtensionAccessToken } from '@/features/auth/utils'
import Log from '@/utils/Log'

const log = new Log('Background/Chat/MaxAIArtChat')

class MaxAIArtChat extends BaseChat {
  status: ChatStatus = 'needAuth'
  private lastActiveTabId?: number
  private token?: string
  constructor() {
    super('MaxAIArtChat')
    this.init()
  }
  private init() {
    log.info('init')
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
  private async checkTokenAndUpdateStatus() {
    const prevStatus = this.status
    this.token = await this.getToken()
    this.status = this.token ? 'success' : 'needAuth'
    if (prevStatus !== this.status) {
      log.info('checkTokenAndUpdateStatus', this.status, this.lastActiveTabId)
      // 本来要切回去chat页面,流程改了，不需要这个变量来切换了
      this.lastActiveTabId = undefined
    }
    await this.updateClientStatus()
  }

  /**
   * 获取回答
   * @param message_content 问题
   * @param options
   * @param onMessage 回调
   * @param options.regenerate 是否重新生成
   * @param options.taskId 任务id
   */
  async askChatGPT(
    message_content: IMaxAIChatMessageContent[],
    options?: {
      taskId: string
      regenerate?: boolean
      chat_history?: IMaxAIChatMessage[]
      meta?: Record<string, any>
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
    await this.checkTokenAndUpdateStatus()
    if (this.status !== 'success') {
      onMessage &&
        onMessage({
          type: 'error',
          done: true,
          error: 'Your session has expired. Please log in.',
          data: {
            text: '',
            conversationId: '',
          },
        })
      return
    }
    const { taskId, meta } = options || {}
    const userConfig = await getThirdProviderSettings('MAXAI_ART')
    const postBody = Object.assign({
      prompt: message_content?.[0]?.text || '',
      chrome_extension_version: APP_VERSION,
      model_name:
        this.conversation?.meta.AIModel ||
        userConfig!.model ||
        MAXAI_IMAGE_GENERATE_MODELS[0].value,
      prompt_id: meta?.contextMenu?.id || 'chat',
      prompt_name: meta?.contextMenu?.text || 'chat',
      style: 'vivid',
      size: '1024x1024',
      n: 1,
    })
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    log.info('streaming start', postBody)
    // 后端会每段每段的给前端返回数据
    // 前端保持匀速输出内容
    const messageResult = ''
    const hasError = false
    const conversationId = this.conversation?.id || ''
    const isTokenExpired = false
    debugger
    try {
      const result = await fetch(
        `${APP_USE_CHAT_GPT_API_HOST}/gpt/get_image_generate_response`,
        {
          method: 'POST',
          signal,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify(postBody),
        },
      )
      debugger
    } catch (e) {
      debugger
    }
    if (isTokenExpired) {
      log.info('user token expired')
      this.status = 'needAuth'
      await chromeExtensionLogout()
      await this.updateClientStatus()
    }
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
    // await this.updateClientStatus()
    this.active = false
  }
  private async getToken() {
    return await getChromeExtensionAccessToken()
  }
  async updateClientStatus() {
    if (this.active) {
      console.log('Client_authChatGPTProvider updateClientStatus', this.status)
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
      })
    }
  }
}
export { MaxAIArtChat }
