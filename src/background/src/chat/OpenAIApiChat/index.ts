import { ChatStatus } from '@/background/provider/chat'
import Log from '@/utils/Log'
import { AI_PROVIDER_MAP } from '@/constants'
import {
  backgroundSendAllClientMessage,
  createChromeExtensionOptionsPage,
} from '@/background/utils'
import { fetchSSE } from '@/features/chatgpt/core/fetch-sse'
import { v4 as uuidV4 } from 'uuid'

import { IOpenAIApiChatMessage } from '@/background/src/chat/OpenAiApiChat/types'
import BaseChat from '@/background/src/chat/BaseChat'
import { getThirdProviderSettings } from '@/background/src/chat/util'

const log = new Log('Background/Chat/OpenAiApiChat')

class OpenAiApiChat extends BaseChat {
  status: ChatStatus = 'needAuth'
  constructor() {
    super('OpenAiApiChat')
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
      history,
    } = options || {}
    const chatGPTApiSettings = await this.getChatGPTAPISettings()
    if (!chatGPTApiSettings) {
      // need Auth
      this.status = 'needAuth'
      await this.updateClientStatus()
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
    await fetchSSE(`${chatGPTApiSettings.apiHost}/v1/chat/completions`, {
      provider: AI_PROVIDER_MAP.OPENAI_API,
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${chatGPTApiSettings.apiKey}`,
      },
      body: JSON.stringify({
        model: chatGPTApiSettings.model,
        messages,
        temperature: chatGPTApiSettings.temperature,
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
          const { error } = JSON.parse(err.message || err)
          log.error('sse error', err)
          // 没有使用这个模型的权限，或者没有这个模型
          if (error?.code === 'model_not_found') {
            onMessage &&
              onMessage({
                type: 'error',
                error: `${error?.message}\nChange model at the top of the sidebar ☝️`,
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
    const settings = await getThirdProviderSettings('OPENAI_API')
    if (!settings?.apiKey || !settings.apiHost) {
      this.status = 'needAuth'
      await this.updateClientStatus()
      return false
    } else {
      this.status = 'success'
      await this.updateClientStatus()
      return true
    }
  }
  async getChatGPTAPISettings() {
    const settings = await getThirdProviderSettings('OPENAI_API')
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
    await this.updateClientStatus()
    this.active = false
  }
  async updateClientStatus() {
    if (this.active) {
      await backgroundSendAllClientMessage('Client_ChatGPTStatusUpdate', {
        status: this.status,
      })
    }
  }
}
export { OpenAiApiChat }
export { OPENAI_API_MODELS } from '@/background/src/chat/OpenAIApiChat/types'
