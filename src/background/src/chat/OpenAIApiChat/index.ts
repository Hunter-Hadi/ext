import { v4 as uuidV4 } from 'uuid'

import { ConversationStatusType } from '@/background/provider/chat'
import BaseChat from '@/background/src/chat/BaseChat'
import { IOpenAIApiChatMessage } from '@/background/src/chat/OpenAIApiChat/types'
import { getAIProviderSettings } from '@/background/src/chat/util'
import { createChromeExtensionOptionsPage } from '@/background/utils'
import { AI_PROVIDER_MAP } from '@/constants'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { hasData } from '@/utils'
import Log from '@/utils/Log'

const log = new Log('Background/Chat/OpenAIApiChat')

class OpenAIApiChat extends BaseChat {
  status: ConversationStatusType = 'needAuth'
  constructor() {
    super('OpenAIApiChat')
    this.init()
  }
  private init() {
    log.info('init')
  }
  async preAuth() {
    this.active = true
    await this.checkApiKey()
  }
  async auth() {
    this.active = true
    await this.checkApiKey()
    if (this.status === 'needAuth') {
      await createChromeExtensionOptionsPage('#/openai-api-key')
    }
  }
  async askChatGPT(
    question: string,
    options?: {
      taskId: string
      include_history?: boolean
      regenerate?: boolean
      streaming?: boolean
      max_history_message_cnt?: number
      history: IOpenAIApiChatMessage[]
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
    const {
      taskId,
      // include_history = false,
      // streaming = true,
      // regenerate = false,
      // max_history_message_cnt = 0,
      meta,
      history,
    } = options || {}
    const chatGPTApiSettings = await this.getChatGPTAPISettings()
    debugger
    if (!chatGPTApiSettings) {
      // need Auth
      this.status = 'needAuth'
      await this.updateStatus()
      return
    }
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    const messages = history || []
    messages.push({
      role: 'user',
      content: question,
    })
    const conversationId = uuidV4()
    const result: IOpenAIApiChatMessage = { role: 'assistant', content: '' }
    let temperature = chatGPTApiSettings.temperature
      ? Math.min(chatGPTApiSettings.temperature, 1.2)
      : undefined
    if (hasData(meta?.temperature)) {
      temperature = meta?.temperature
    }
    await fetchSSE(`${chatGPTApiSettings.apiHost}/v1/chat/completions`, {
      provider: AI_PROVIDER_MAP.OPENAI_API,
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${chatGPTApiSettings.apiKey}`,
      },
      body: JSON.stringify({
        model: meta?.model ?? chatGPTApiSettings.model,
        messages,
        /**
         * MARK: 将 OpenAI API的温度控制加一个最大值限制：1.6 - 2023-08-25 - @huangsong
         */
        temperature,
        stream: true,
      }),
      onMessage: (message: string) => {
        console.debug('chatgpt sse message', message)
        if (message === '[DONE]') {
          onMessage &&
            onMessage({
              type: 'message',
              done: true,
              error: '',
              data: {
                text: result.content,
                conversationId,
              },
            })
          return
        }
        let data
        try {
          data = JSON.parse(message)
        } catch (err) {
          console.error(err)
          return
        }
        if (data?.choices?.length) {
          const delta = data.choices[0].delta
          if (delta?.content) {
            result.content += delta.content
          }
        }
        onMessage &&
          onMessage({
            type: 'message',
            done: false,
            error: '',
            data: {
              text: result.content,
              conversationId,
            },
          })
      },
    })
      .then()
      .catch((err) => {
        log.info('streaming end error', err)
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
          const { error } = JSON.parse(err.message || err)
          log.error('sse error', err)
          // 没有使用这个模型的权限，或者没有这个模型
          if (error?.code === 'model_not_found') {
            onMessage &&
              onMessage({
                type: 'error',
                error: `${error?.message}`,
                done: true,
                data: { text: '', conversationId },
              })
            return
          }
          // '这通常意味着您需要在OpenAI账户中添加付款方式，请查看：'
          if (err.message.includes('insufficient_quota')) {
            onMessage &&
              onMessage({
                type: 'error',
                error: `You exceeded your current OpenAI quota, please check your [OpenAI plan and billing details](https://platform.openai.com/account/usage).`,
                done: true,
                data: { text: '', conversationId },
              })
            return
          }
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
  }
  resetMessagesContext() {
    // this.messagesContext = {}
  }
  async checkApiKey() {
    const settings = await getAIProviderSettings('OPENAI_API')
    if (!settings?.apiKey || !settings.apiHost) {
      this.status = 'needAuth'
      await this.updateStatus()
      return false
    } else {
      this.status = 'success'
      await this.updateStatus()
      return true
    }
  }
  async getChatGPTAPISettings() {
    const settings = await getAIProviderSettings('OPENAI_API')
    return settings?.apiKey && settings.apiHost ? settings : false
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
    await this.updateStatus()
    this.active = false
  }
  async updateStatus() {
    if (this.active) {
      await this.updateClientConversationChatStatus()
    }
  }
}
export { OpenAIApiChat }
export { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat/types'
