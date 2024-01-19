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
    const { taskId, meta, chat_history } = options || {}
    const conversationId = this.conversation?.id || ''
    const userConfig = await getThirdProviderSettings('MAXAI_DALLE')
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    try {
      if (chat_history?.find((history) => history.role === 'system')) {
        // 说明需要转换自然语言为prompt
        const result = await fetch(
          `${APP_USE_CHAT_GPT_API_HOST}/gpt/get_chatgpt_response`,
          {
            method: 'POST',
            signal,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify({
              streaming: false,
              chat_history,
              message_content,
              chrome_extension_version: APP_VERSION,
              model_name: 'gpt-3.5-turbo',
              prompt_id: meta?.contextMenu?.id || 'chat',
              prompt_name: meta?.contextMenu?.text || 'chat',
            }),
          },
        ).then((res) => res.json())
        if (result.status === 'OK') {
          onMessage?.({
            done: true,
            type: 'message',
            error: '',
            data: {
              text: result.text || message_content?.[0]?.text || '',
              conversationId,
            },
          })
        } else {
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error:
                'Something went wrong, please try again. If this issue persists, contact us via email.',
              data: { text: '', conversationId },
            })
        }
      } else {
        const result = await fetch(
          `${APP_USE_CHAT_GPT_API_HOST}/gpt/get_image_generate_response`,
          {
            method: 'POST',
            signal,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.token}`,
            },
            body: JSON.stringify({
              prompt: message_content?.[0]?.text || '',
              chrome_extension_version: APP_VERSION,
              model_name:
                this.conversation?.meta.AIModel ||
                userConfig!.model ||
                MAXAI_IMAGE_GENERATE_MODELS[0].value,
              prompt_id: meta?.contextMenu?.id || 'chat',
              prompt_name: meta?.contextMenu?.text || 'chat',
              style: userConfig?.contentType || 'vivid',
              size:
                userConfig?.resolution?.length === 2
                  ? `${userConfig.resolution[0]}x${userConfig.resolution[1]}`
                  : `1024x1024`,
              n: userConfig?.generateCount || 1,
            }),
          },
        ).then((res) => res.json())
        if (result.status === 'OK' && result.data?.length) {
          const resultJson = JSON.stringify(
            result.data.map((imageData: { url: string }) => {
              return {
                ...userConfig,
                ...imageData,
              }
            }),
          )
          onMessage?.({
            done: true,
            type: 'message',
            error: '',
            data: {
              text: resultJson,
              conversationId,
            },
          })
        } else {
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error:
                'Something went wrong, please try again. If this issue persists, contact us via email.',
              data: { text: '', conversationId },
            })
        }
      }
    } catch (e) {
      onMessage &&
        onMessage({
          done: true,
          type: 'error',
          error:
            'Something went wrong, please try again. If this issue persists, contact us via email.',
          data: { text: '', conversationId },
        })
    }
    const isTokenExpired = false
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
