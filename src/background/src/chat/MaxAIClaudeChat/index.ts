import { ChatStatus } from '@/background/provider/chat'
import Log from '@/utils/Log'
import Browser from 'webextension-polyfill'
import {
  APP_USE_CHAT_GPT_API_HOST,
  APP_USE_CHAT_GPT_HOST,
  AI_PROVIDER_MAP,
  BACKGROUND_SEND_TEXT_SPEED_SETTINGS,
  APP_VERSION,
} from '@/constants'
import {
  backgroundSendAllClientMessage,
  chromeExtensionLogout,
} from '@/background/utils'
import { getThirdProviderSettings } from '@/background/src/chat/util'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { getChromeExtensionAccessToken } from '@/features/auth/utils'
import BaseChat from '@/background/src/chat/BaseChat'
import { sendLarkBotMessage } from '@/utils/larkBot'
import { isPermissionCardSceneType } from '@/features/auth/components/PermissionWrapper/types'
import {
  IMaxAIClaudeMessageType,
  MAXAI_CLAUDE_MODELS,
} from '@/background/src/chat/MaxAIClaudeChat/types'

const log = new Log('Background/Chat/MaxAIClaudeChat')

class MaxAIClaudeChat extends BaseChat {
  status: ChatStatus = 'needAuth'
  private lastActiveTabId?: number
  private token?: string
  constructor() {
    super('MaxAIClaudeChat')
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
   * @param question 问题
   * @param options
   * @param onMessage 回调
   * @param options.regenerate 是否重新生成
   * @param options.streaming 是否流式
   * @param options.taskId 任务id
   */
  async askChatGPT(
    question: string,
    options?: {
      taskId: string
      regenerate?: boolean
      streaming?: boolean
      chat_history?: IMaxAIClaudeMessageType[]
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
    } = options || {}
    const userConfig = await getThirdProviderSettings('MAXAI_CLAUDE')
    const postBody = Object.assign(
      {
        chat_history,
        regenerate,
        streaming,
        message_content: question,
        chrome_extension_version: APP_VERSION,
        model_name:
          this.conversation?.meta.AIModel ||
          userConfig!.model ||
          MAXAI_CLAUDE_MODELS[0].value,
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
    let isEnd = false
    let hasError = false
    let sentTextLength = 0
    let conversationId = this.conversation?.id || ''
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
    let isTokenExpired = false
    await fetchSSE(`${APP_USE_CHAT_GPT_API_HOST}/gpt/get_claude_response`, {
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
          }
          log.debug('streaming on message', messageResult)
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
      if (messageResult === '') {
        // HACK: 后端现在偶尔会返回空字符串，这里做个fallback
        sendLarkBotMessage(
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
        onMessage &&
          onMessage({
            done: true,
            type: 'error',
            error:
              'Something went wrong, please try again. If this issue persists, contact us via email.',
            data: { text: '', conversationId },
          })
      } else {
        isEnd = true
      }
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
export { MaxAIClaudeChat }