import { v4 as uuidv4, v4 as uuidV4 } from 'uuid'
import { fetchSSE } from './fetch-sse'

export interface IChatGPTAnswer {
  text: string
  messageId: string
  conversationId: string
  parentMessageId?: string
}
export type Event =
  | {
      type: 'answer'
      data: IChatGPTAnswer
    }
  | {
      type: 'done'
    }
  | {
      type: 'error'
      data: {
        message: string
        detail: string
      }
    }

export interface GenerateAnswerParams {
  messageId?: string
  parentMessageId?: string
  prompt: string
  onEvent: (event: Event) => void
  signal?: AbortSignal
}
export interface IChatGPTConversation {
  id: string
  conversationId?: string
}

export interface IChatGPTDaemonProcess {
  createConversation: (
    conversationId?: string,
  ) => Promise<ChatGPTConversation | undefined>
  getConversation: (conversationId: string) => ChatGPTConversation | undefined
  getConversations: () => ChatGPTConversation[]
  closeConversation: (conversationId: string) => Promise<void>
  addAbortWithMessageId: (messageId: string, abortFn: () => void) => void
  removeAbortWithMessageId: (messageId: string) => void
  abortWithMessageId: (messageId: string) => void
}

const CHAT_GPT_PROXY_HOST = `https://chat.openai.com`

const chatGptRequest = (
  token: string,
  method: string,
  path: string,
  data?: unknown,
) => {
  return fetch(`${CHAT_GPT_PROXY_HOST}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  })
}
export const setConversationProperty = async (
  token: string,
  conversationId: string,
  propertyObject: any,
) => {
  await chatGptRequest(
    token,
    'PATCH',
    `/backend-api/conversation/${conversationId}`,
    propertyObject,
  )
}

export const getChatGPTAccessToken = async (
  notCatchError = false,
): Promise<string> => {
  const resp = await fetch('https://chat.openai.com/api/auth/session')
  if (resp.status === 403 && !notCatchError) {
    throw new Error('CLOUDFLARE')
  }
  const data = await resp.json().catch(() => ({}))
  if (!data.accessToken && !notCatchError) {
    throw new Error('UNAUTHORIZED')
  }
  return data?.accessToken || ''
}

class ChatGPTConversation {
  id: string
  token: string
  model: string
  conversationId?: string
  // regenerate last question answer - parent message id
  lastChatGPTAnswerMessageId: string
  constructor(props: {
    token: string
    model: string
    conversationId?: string
  }) {
    this.token = props.token
    this.model = props.model
    this.lastChatGPTAnswerMessageId = uuidv4()
    this.id = uuidV4()
    this.conversationId = props.conversationId || undefined
  }
  async generateAnswer(params: GenerateAnswerParams, regenerate = false) {
    const questionId = params.messageId || uuidV4()
    const parentMessageId =
      params.parentMessageId || this.lastChatGPTAnswerMessageId || uuidV4()

    console.debug(
      'generateAnswer start',
      this.conversationId,
      questionId,
      parentMessageId,
    )
    await fetchSSE(`${CHAT_GPT_PROXY_HOST}/backend-api/conversation`, {
      method: 'POST',
      signal: params.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(
        Object.assign(
          {
            action: regenerate ? 'variant' : 'next',
            messages: [
              {
                id: questionId,
                role: 'user',
                content: {
                  content_type: 'text',
                  parts: [params.prompt],
                },
              },
            ],
            model: this.model,
            parent_message_id: parentMessageId,
          },
          this.conversationId
            ? {
                conversation_id: this.conversationId,
              }
            : {},
        ),
      ),
      onMessage: (message: string) => {
        // console.debug('sse message', message)
        if (message === '[DONE]') {
          params.onEvent({ type: 'done' })
          return
        }
        let data
        try {
          data = JSON.parse(message)
        } catch (err) {
          console.error(err)
          return
        }
        const text = data.message?.content?.parts?.[0]
        if (text) {
          console.log('generateAnswer on text', data)
          this.conversationId = data.conversation_id
          this.lastChatGPTAnswerMessageId = data.message.id
          params.onEvent({
            type: 'answer',
            data: {
              text,
              messageId: data.message.id,
              conversationId: data.conversation_id,
              parentMessageId: questionId,
            },
          })
        }
      },
    })
      .then()
      .catch((err) => {
        try {
          if (err?.message === 'The user aborted a request.') {
            params.onEvent({
              type: 'error',
              data: { message: 'manual aborted request.', detail: '' },
            })
            return
          }
          const error = JSON.parse(err.message || err)
          console.error('sse error', err)
          params.onEvent({
            type: 'error',
            data: { message: error.message, detail: error.detail },
          })
        } catch (e) {
          params.onEvent({
            type: 'error',
            data: { message: 'Network error.', detail: '' },
          })
        }
      })
  }
  async close() {
    if (this.conversationId) {
      await setConversationProperty(this.token, this.conversationId, {
        is_visible: false,
      })
    }
  }
}

export class ChatGPTDaemonProcess implements IChatGPTDaemonProcess {
  conversations: ChatGPTConversation[]
  abortFunctions: {
    [conversationId: string]: () => void
  }
  constructor() {
    this.conversations = []
    this.abortFunctions = {}
  }
  private async fetchModels(
    token: string,
  ): Promise<
    { slug: string; title: string; description: string; max_tokens: number }[]
  > {
    const resp = await chatGptRequest(token, 'GET', '/backend-api/models').then(
      (r) => r.json(),
    )
    return resp.models
  }
  private async getModelName(token: string): Promise<string> {
    try {
      const models = await this.fetchModels(token)
      return models[0].slug
    } catch (err) {
      console.error(err)
      return 'text-davinci-002-render'
    }
  }
  async createConversation(conversationId?: string) {
    try {
      const token = await getChatGPTAccessToken()
      const model = await this.getModelName(token)
      const conversationInstance = new ChatGPTConversation({
        token,
        model,
        conversationId,
      })
      this.conversations.push(conversationInstance)
      console.log(conversationInstance)
      return conversationInstance
    } catch (error) {
      console.error('createConversation error:\t', error)
      if ((error as any).message === 'CLOUDFLARE') {
        // 刷新网页
        location.reload()
      }
      return undefined
    }
  }
  getConversation(conversationId: string) {
    return this.conversations.find(
      (c) => c.id === conversationId || c.conversationId === conversationId,
    )
  }
  getConversations() {
    return this.conversations
  }
  async closeConversation(conversationId: string) {
    try {
      const token = await getChatGPTAccessToken(true)
      await setConversationProperty(token, conversationId, {
        is_visible: false,
      })
    } catch (e) {
      console.error(e)
    }
  }
  addAbortWithMessageId(messageId: string, abortFunction: () => void) {
    this.abortFunctions[messageId] = abortFunction
  }
  removeAbortWithMessageId(messageId: string) {
    delete this.abortFunctions[messageId]
  }
  abortWithMessageId(messageId: string) {
    try {
      console.log(messageId)
      if (this.abortFunctions[messageId]) {
        console.log('abort Controller abort runed', messageId)
        this.abortFunctions[messageId]()
        delete this.abortFunctions[messageId]
        console.log(this.abortFunctions)
      }
    } catch (e) {
      console.error('abortWithMessageId error', e)
    }
  }
}
