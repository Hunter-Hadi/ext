import BaseChat from '@/background/src/chat/BaseChat'
import {
  fetchBardRequestParams,
  parseBardResponse,
} from '@/background/src/chat/BardChat/utils'
import { ofetch } from 'ofetch'
import Browser from 'webextension-polyfill'
import { v4 as uuidV4 } from 'uuid'

function generateReqId() {
  return Math.floor(Math.random() * 900000) + 100000
}

class BardChat extends BaseChat {
  private token?: {
    atValue: string
    blValue: string
  }
  contextIds: [string, string, string] = ['', '', '']
  conversationId?: string
  constructor() {
    super('BardChat')
    this.token = undefined
  }
  async checkAuth() {
    if (this.token) {
      await this.updateClientStatus('success')
    } else {
      await this.updateClientStatus('needAuth')
    }
  }
  async auth() {
    this.active = true
    if (!(await this.syncBardToken())) {
      // need Auth
      await this.updateClientStatus('needAuth')
      await Browser.tabs.create({
        url: 'https://bard.google.com/',
        active: true,
      })
    } else {
      await this.updateClientStatus('success')
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
    if (!this.conversationId) {
      this.conversationId = uuidV4()
    }
    const {
      taskId,
      // include_history = false,
      // streaming = true,
      // regenerate = false,
      // max_history_message_cnt = 0,
    } = options || {}
    if (!this.token) {
      const authResult = await this.syncBardToken()
      if (!authResult) {
        // need Auth
      }
      this.status = 'needAuth'
      await this.updateClientStatus(this.status)
      return
    }
    const controller = new AbortController()
    const signal = controller.signal
    if (taskId) {
      this.taskList[taskId] = () => controller.abort()
    }
    const result = await ofetch(
      'https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate',
      {
        method: 'POST',
        signal: signal,
        query: {
          bl: this.token.blValue,
          _reqid: generateReqId(),
          rt: 'c',
        },
        body: new URLSearchParams({
          at: this.token.atValue,
          'f.req': JSON.stringify([
            null,
            `[[${JSON.stringify(question)}],null,${JSON.stringify(
              this.contextIds,
            )}]`,
          ]),
        }),
        parseResponse: (txt) => txt,
      },
    )
    const { text, ids } = parseBardResponse(result)
    this.log.debug('result', result, text, ids)
    if (text && ids) {
      onMessage &&
        onMessage({
          type: 'message',
          done: false,
          error: '',
          data: {
            text,
            conversationId: this.conversationId,
          },
        })
      onMessage &&
        onMessage({
          type: 'message',
          done: true,
          error: '',
          data: {
            text,
            conversationId: this.conversationId,
          },
        })
      this.contextIds = ids
    } else {
      onMessage &&
        onMessage({
          type: 'error',
          done: true,
          error: 'BardChat: Unknown Error',
          data: {
            text: '',
            conversationId: this.conversationId,
          },
        })
    }
  }
  async syncBardToken() {
    const { atValue, blValue } = await fetchBardRequestParams()
    if (!atValue || !blValue) {
      this.token = undefined
      return false
    }
    this.token = { atValue, blValue }
    return true
  }
  reset() {
    this.conversationId = ''
    this.contextIds = ['', '', '']
  }
}

export { BardChat }