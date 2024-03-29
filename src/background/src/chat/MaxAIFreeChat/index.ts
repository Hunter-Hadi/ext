import Browser from 'webextension-polyfill'

import { ChatStatus } from '@/background/provider/chat'
import BaseChat from '@/background/src/chat/BaseChat'
import { MAXAI_FREE_MODELS } from '@/background/src/chat/MaxAIFreeChat/types'
import {
  IMaxAIChatMessageContent,
  IMaxAIRequestHistoryMessage,
} from '@/background/src/chat/UseChatGPTChat/types'
import { getAIProviderSettings } from '@/background/src/chat/util'
import {
  backgroundSendAllClientMessage,
  chromeExtensionLogout,
} from '@/background/utils'
import {
  AI_PROVIDER_MAP,
  APP_USE_CHAT_GPT_API_HOST,
  APP_USE_CHAT_GPT_HOST,
  APP_VERSION,
} from '@/constants'
import { isPermissionCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import Log from '@/utils/Log'
import { backgroundSendMaxAINotification } from '@/utils/sendMaxAINotification/background'

const log = new Log('Background/Chat/MaxAIFreeChat')

class MaxAIFreeChat extends BaseChat {
  status: ChatStatus = 'success'
  private lastActiveTabId?: number
  private token?: string
  constructor() {
    super('MaxAIFreeChat')
    this.init()
  }
  private init() {
    log.info('init')
  }
  async preAuth() {
    this.active = true
    this.status = 'success'
    await this.updateClientStatus()
    // await this.checkTokenAndUpdateStatus()
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
   * @param options.streaming 是否流式
   * @param options.taskId 任务id
   */
  async askChatGPT(
    message_content: IMaxAIChatMessageContent[],
    options?: {
      taskId: string
      regenerate?: boolean
      streaming?: boolean
      chat_history?: IMaxAIRequestHistoryMessage[]
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
    const {
      taskId,
      streaming = true,
      regenerate = false,
      chat_history = [],
      meta,
    } = options || {}
    const userConfig = await getAIProviderSettings('MAXAI_FREE')
    const postBody = Object.assign(
      {
        chat_history,
        regenerate,
        streaming,
        message_content,
        chrome_extension_version: APP_VERSION,
        model_name:
          this.conversation?.meta.AIModel ||
          userConfig!.model ||
          MAXAI_FREE_MODELS[0].value,
        prompt_id: meta?.contextMenu?.id || 'chat',
        prompt_name: meta?.contextMenu?.text || 'chat',
        // TODO: 界面还没做
        // temperature: isNumber(userConfig?.temperature)
        //   ? userConfig!.temperature
        //   : 1,
      },
      // { conversation_id: this.conversation?.id || '' },
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
    let hasError = false
    let conversationId = this.conversation?.id || ''
    let isTokenExpired = false
    await fetchSSE(
      `${APP_USE_CHAT_GPT_API_HOST}/gpt/get_freeai_chat_response`,
      {
        provider: AI_PROVIDER_MAP.USE_CHAT_GPT_PLUS,
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
            if (messageData?.conversation_id) {
              conversationId = messageData.conversation_id
            }
            if (messageData?.text) {
              // 记录到结果里，前端分流输出
              messageResult += messageData.text
              onMessage &&
                onMessage({
                  type: 'message',
                  done: false,
                  error: '',
                  data: {
                    text: messageResult,
                    conversationId: conversationId,
                  },
                })
            }
            log.debug('streaming on message', messageResult)
          } catch (e) {
            log.error('parse message.data error: \t', e)
          }
        },
      },
    )
      .then()
      .catch((err) => {
        log.info('streaming end error', err)
        hasError = true
        if (
          err?.message === 'BodyStreamBuffer was aborted' ||
          err?.message === 'The user aborted a request.'
        ) {
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
          // 判断是不是付费model触发上线
          if (error.msg && isPermissionCardSceneType(error.msg)) {
            onMessage &&
              onMessage({
                type: 'error',
                error: error.msg,
                done: true,
                data: { text: '', conversationId },
              })
            return
          }
          if (error?.code === 401) {
            isTokenExpired = true
          }
          log.error('sse error', err)
          onMessage &&
            onMessage({
              done: true,
              type: 'error',
              error:
                error.message ||
                error.detail ||
                'Something went wrong, please try again. If this issue persists, contact us via email.',
              data: { text: '', conversationId },
            })
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
      })
    log.info('streaming end success')
    if (hasError) {
      if (messageResult === '') {
        // HACK: 后端现在偶尔会返回空字符串，这里做个fallback
        backgroundSendMaxAINotification(
          'MAXAI_API',
          '[API] response empty string.',
          JSON.stringify(
            {
              model: postBody.model_name,
              promptTextLength: postBody.message_content.length,
            },
            null,
            2,
          ),
          {
            uuid: '6f02f533-def6-4696-b14e-1b00c2d9a4df',
          },
        )
      }
    } else {
      onMessage &&
        onMessage({
          done: true,
          type: 'message',
          error: '',
          data: {
            text: messageResult,
            conversationId,
          },
        })
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
    return await getMaxAIChromeExtensionAccessToken()
  }
  async updateClientStatus() {
    if (this.active) {
      console.log('Client_AuthAIProvider updateClientStatus', this.status)
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
      })
    }
  }
}
export { MaxAIFreeChat }
