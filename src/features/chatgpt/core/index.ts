import { v4 as uuidv4, v4 as uuidV4 } from 'uuid'
import { fetchSSE } from './fetch-sse'
import { mappingToMessages } from '@/features/chatgpt/core/util'
import { CHAT_GPT_PROVIDER } from '@/types'

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
export interface IChatGPTConversationRawMappingData {
  id: string
  parent: string
  children: string[]
  message?: {
    id: string
    author: {
      role: string
      metadata: {
        [key: string]: any
      }
    }
    create_time: number
    content: {
      content_type: string
      parts: string[]
    }
    end_turn: boolean
    weight: number
    metadata: {
      model_slug: string
      finish_details: {
        type: string
        stop: string
      }
    }
    recipient: string
  }
}

export interface IChatGPTConversationRaw {
  title: string
  // 当前的node，可以理解为conversation最后的messageId
  current_node: string
  mapping: {
    [key: string]: IChatGPTConversationRawMappingData
  }
  moderation_results: any[]
  create_time: number
  update_time: number
}

export interface IChatGPTConversation {
  id: string
  conversationId?: string
}

type IModal = {
  slug: string
  title: string
  description: string
  max_tokens: number
}
export interface IChatGPTDaemonProcess {
  token?: string
  models: IModal[]
  createConversation: (
    conversationId?: string,
    selectedModel?: string,
  ) => Promise<ChatGPTConversation | undefined>
  getAllModels: () => Promise<IModal[]>
  getConversation: (conversationId: string) => ChatGPTConversation | undefined
  getConversations: () => ChatGPTConversation[]
  closeConversation: (conversationId: string) => Promise<boolean>
  addAbortWithMessageId: (messageId: string, abortFn: () => void) => void
  removeAbortWithMessageId: (messageId: string) => void
  abortWithMessageId: (messageId: string) => void
}

const CHAT_GPT_PROXY_HOST = `https://chat.openai.com`
const CHAT_TITLE = 'UseChatGPT.AI'

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
  conversationInfo: {
    title: string
    messages: Array<{
      messageId: string
      parentMessageId: string
      text: string
    }>
    raw?: IChatGPTConversationRaw
  }
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
    this.conversationInfo = {
      title: '',
      messages: [],
    }
  }
  async updateTitle(title: string) {
    if (!this.conversationId) {
      return
    }
    await setConversationProperty(this.token, this.conversationId, {
      title,
    })
    this.conversationInfo.title = title
  }
  async fetchHistoryAndConfig() {
    if (!this.conversationId) {
      return
    }
    try {
      const result = await chatGptRequest(
        this.token,
        'GET',
        `/backend-api/conversation/${this.conversationId}`,
      )
      const chatGPTConversationRaw: IChatGPTConversationRaw =
        await result.json()
      this.conversationInfo = {
        title: chatGPTConversationRaw.title,
        messages: mappingToMessages(
          chatGPTConversationRaw.current_node,
          chatGPTConversationRaw.mapping,
        ),
        raw: chatGPTConversationRaw,
      }
      if (chatGPTConversationRaw.title !== CHAT_TITLE) {
        await this.updateTitle(CHAT_TITLE)
      }
      console.log(result)
      this.lastChatGPTAnswerMessageId = chatGPTConversationRaw.current_node
    } catch (e) {
      console.error(e)
      this.lastChatGPTAnswerMessageId = uuidv4()
      this.conversationId = undefined
      this.conversationInfo = {
        title: '',
        messages: [],
      }
    }
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
      provider: CHAT_GPT_PROVIDER.OPENAI,
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
        console.debug('sse message', message)
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
  token?: string
  conversations: ChatGPTConversation[]
  abortFunctions: {
    [conversationId: string]: () => void
  }
  models: IModal[]
  constructor() {
    this.conversations = []
    this.abortFunctions = {}
    this.token = undefined
    this.models = []
  }
  private async fetchModels(
    token: string,
  ): Promise<
    { slug: string; title: string; description: string; max_tokens: number }[]
  > {
    if (this.models.length > 0) {
      return this.models
    }
    const resp = await chatGptRequest(token, 'GET', '/backend-api/models').then(
      (r) => r.json(),
    )
    if (resp?.models && resp.models.length > 0) {
      this.models = resp.models
    }
    return resp.models
  }
  private async getModelName(
    token: string,
    selectModel?: string,
  ): Promise<string> {
    try {
      const models = await this.fetchModels(token)
      if (models?.length > 0) {
        if (selectModel) {
          const model = models.find((m) => m.slug === selectModel)
          if (model) {
            return model.slug
          }
        }
        return models[0].slug
      }
      return 'text-davinci-002-render-sha'
    } catch (err) {
      console.error(err)
      return 'text-davinci-002-render-sha'
    }
  }
  async getAllModels() {
    if (this.models.length > 0) {
      return this.models
    }
    try {
      const token = this.token || (await getChatGPTAccessToken())
      if (token) {
        this.token = token
      }
      return await this.fetchModels(token)
    } catch (e) {
      console.error(e)
      return []
    }
  }
  async createConversation(conversationId?: string, selectedModel?: string) {
    if (this.conversations.length > 0) {
      return this.conversations[0]
    }
    try {
      const token = this.token || (await getChatGPTAccessToken())
      const model = await this.getModelName(token, selectedModel)
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
      let conversation = this.getConversation(conversationId)
      if (!conversation) {
        const token = this.token || (await getChatGPTAccessToken())
        const model = await this.getModelName(token, this.models[0].slug)
        conversation = new ChatGPTConversation({
          token,
          model,
          conversationId,
        })
      }
      await conversation.close()
      this.conversations = this.conversations.filter(
        (conversation) => conversation.conversationId !== conversationId,
      )
      return true
    } catch (e) {
      console.error(e)
      return false
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
